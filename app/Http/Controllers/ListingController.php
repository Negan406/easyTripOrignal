<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use App\Models\ListingPhoto;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Cloudinary\Cloudinary;
use Cloudinary\Configuration\Configuration;

class ListingController extends Controller
{
    private function uploadImage($file, $folder = 'easytrip/listings')
    {
        // Use Cloudinary in production, local storage in development
        if (app()->environment('production')) {
            $config = new Configuration();
            $config->cloud->cloudName = env('CLOUDINARY_CLOUD_NAME');
            $config->cloud->apiKey    = env('CLOUDINARY_API_KEY');
            $config->cloud->apiSecret = env('CLOUDINARY_API_SECRET');
            $config->api->verifySslCert = true;
            $cloudinary = new Cloudinary($config);

            return $cloudinary->uploadApi()->upload(
                $file->getRealPath(),
                ['folder' => $folder]
            )['secure_url'];
        }

        // Local development — use public storage
        return asset('storage/' . $file->store($folder, 'public'));
    }

    public function index()
    {
        try {
            $listings = Listing::with(['host', 'photos'])
                ->where('status', 'approved')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $listings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch listings: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'location'    => 'required|string',
            'price'       => 'required|numeric|min:0',
            'category'    => 'required|string|in:beach-houses,city-apartments,mountain-cabins,luxury-villas,pools,desert',
            'main_photo'  => 'required|image|mimes:jpeg,png,jpg|max:5120',
            'photos.*'    => 'nullable|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        if ($validator->fails()) {
            \Illuminate\Support\Facades\Log::error('Validation failed: ' . json_encode($validator->errors()));
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Upload main photo
            $mainPhotoUrl = $this->uploadImage($request->file('main_photo'));

            // Create the listing
            $listing = Listing::create([
                'host_id'     => Auth::id(),
                'title'       => $request->title,
                'description' => $request->description,
                'location'    => $request->location,
                'price'       => $request->price,
                'category'    => $request->category,
                'main_photo'  => $mainPhotoUrl,
                'status'      => 'pending'
            ]);

            // Upload additional photos if any
            if ($request->hasFile('photos')) {
                foreach ($request->file('photos') as $photo) {
                    $photoUrl = $this->uploadImage($photo);
                    ListingPhoto::create([
                        'listing_id' => $listing->id,
                        'photo_url'  => $photoUrl
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Listing created successfully and pending approval',
                'listing' => $listing->load('photos'),
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            Log::error('Listing Creation Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create listing: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function show(Listing $listing)
    {
        return response()->json([
            'success' => true,
            'listing' => $listing->load(['host', 'photos', 'reviews.user'])
        ]);
    }

    public function update(Request $request, Listing $listing)
    {
        if ($listing->host_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], Response::HTTP_FORBIDDEN);
        }

        $validator = Validator::make($request->all(), [
            'title'       => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'location'    => 'sometimes|string',
            'price'       => 'sometimes|numeric|min:0',
            'category'    => 'sometimes|string|in:beach-houses,city-apartments,mountain-cabins,luxury-villas,pools',
            'main_photo'  => 'sometimes|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $data = $request->only([
                'title', 'description', 'location', 'price', 'category'
            ]);

            if ($request->hasFile('main_photo')) {
                $data['main_photo'] = $this->uploadImage($request->file('main_photo'));
            }

            $listing->update($data);

            return response()->json([
                'success' => true,
                'listing' => $listing->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update listing: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function destroy(Listing $listing)
    {
        if (Auth::user()->role !== 'admin' && $listing->host_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], Response::HTTP_FORBIDDEN);
        }

        try {
            DB::beginTransaction();
            foreach ($listing->photos as $photo) {
                $photo->delete();
            }
            $listing->delete();
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Listing deleted successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete listing: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function search(Request $request)
    {
        $query = Listing::query()->where('status', 'approved');

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        if ($request->has('location')) {
            $query->where('location', 'like', '%' . $request->location . '%');
        }
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        $listings = $query->with(['host', 'photos'])->latest()->paginate(12);
        return response()->json($listings);
    }

    public function getPendingListings()
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], Response::HTTP_FORBIDDEN);
        }

        $pendingListings = Listing::with(['host', 'photos'])
            ->where('status', 'pending')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'listings' => $pendingListings
        ]);
    }

    public function approveListing(Listing $listing)
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], Response::HTTP_FORBIDDEN);
        }

        $listing->update(['status' => 'approved']);

        return response()->json([
            'success' => true,
            'message' => 'Listing approved successfully',
            'listing' => $listing->fresh()->load(['host', 'photos'])
        ]);
    }

    public function rejectListing(Listing $listing)
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], Response::HTTP_FORBIDDEN);
        }

        $listing->update(['status' => 'rejected']);

        return response()->json([
            'success' => true,
            'message' => 'Listing rejected successfully',
            'listing' => $listing->fresh()->load(['host', 'photos'])
        ]);
    }

    public function getUserListings()
    {
        $listings = Listing::with(['photos'])
            ->where('host_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'listings' => $listings
        ]);
    }
}