"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface GeneratedContent {
  title: string;
  shortDescription: string;
  description: string;
  inclusions: string[];
  exclusions: string[];
  tags: string[];
}

interface DisneyOffer {
  title: string;
  description: string;
  destination: string;
  priceInfo: string;
  duration: string;
  highlights: string[];
}

interface DisneyImage {
  url: string;
  description: string;
}

interface SocialMediaPost {
  platform: string;
  text: string;
  hashtags: string[];
}

export default function NewPackagePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scanningDisney, setScanningDisney] = useState(false);
  const [disneyOffers, setDisneyOffers] = useState<DisneyOffer[]>([]);
  const [showDisneyModal, setShowDisneyModal] = useState(false);

  // Disney images
  const [scanningImages, setScanningImages] = useState(false);
  const [disneyImages, setDisneyImages] = useState<DisneyImage[]>([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const [downloadingImages, setDownloadingImages] = useState<string[]>([]);

  // Social media posts (Step 4)
  const [createdPackageId, setCreatedPackageId] = useState<number | null>(null);
  const [socialMediaPosts, setSocialMediaPosts] = useState<SocialMediaPost[]>(
    []
  );
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(
    null
  );
  const [adjustmentPrompt, setAdjustmentPrompt] = useState("");
  const [generatingPosts, setGeneratingPosts] = useState(false);

  // Step 1: Basic info
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState("disney-park");
  const [destination, setDestination] = useState("");
  const [nights, setNights] = useState(3);
  const [days, setDays] = useState(4);
  const [startingPrice, setStartingPrice] = useState(1000);
  const [category, setCategory] = useState("family");

  // Step 2: AI Generated content
  const [generatedContent, setGeneratedContent] =
    useState<GeneratedContent | null>(null);
  const [editableContent, setEditableContent] =
    useState<GeneratedContent | null>(null);

  // Step 3: Images
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleScanDisney = async () => {
    setScanningDisney(true);
    setError("");

    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/admin/packages/scan-disney", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("admin_token");
        router.push("/admin");
        return;
      }

      const data = await response.json();
      if (response.ok) {
        setDisneyOffers(data.offers);
        setShowDisneyModal(true);
      } else {
        setError(data.error || "Failed to scan Disney website");
      }
    } catch (err) {
      setError("Failed to scan Disney website. Please try again.");
    } finally {
      setScanningDisney(false);
    }
  };

  const handleSelectDisneyOffer = (offer: DisneyOffer) => {
    // Auto-fill form with Disney offer data
    setPrompt(
      `${offer.description}\n\nHighlights:\n${offer.highlights.join("\n")}`
    );
    setDestination(offer.destination);
    setType("disney-park");

    // Try to extract price if available
    if (offer.priceInfo) {
      const priceMatch = offer.priceInfo.match(/\$(\d+)/);
      if (priceMatch) {
        setStartingPrice(parseInt(priceMatch[1]));
      }
    }

    setShowDisneyModal(false);
  };

  const handleScanDisneyImages = async () => {
    setScanningImages(true);
    setError("");

    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/admin/packages/scan-disney-images", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("admin_token");
        router.push("/admin");
        return;
      }

      const data = await response.json();
      if (response.ok) {
        setDisneyImages(data.images);
        setShowImageModal(true);
      } else {
        setError(data.error || "Failed to scan Disney images");
      }
    } catch (err) {
      setError("Failed to scan Disney images. Please try again.");
    } finally {
      setScanningImages(false);
    }
  };

  const handleSelectDisneyImage = async (imageUrl: string) => {
    setDownloadingImages([...downloadingImages, imageUrl]);

    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/admin/packages/download-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
      });

      const data = await response.json();
      if (response.ok) {
        // Create a File object from the downloaded image
        const imageResponse = await fetch(data.url);
        const blob = await imageResponse.blob();
        const file = new File([blob], data.filename, { type: blob.type });

        // Add to image files and previews
        setImageFiles([...imageFiles, file]);
        setImagePreviews([...imagePreviews, data.url]);
      } else {
        setError(data.error || "Failed to download image");
      }
    } catch (err) {
      setError("Failed to download image. Please try again.");
    } finally {
      setDownloadingImages(downloadingImages.filter((url) => url !== imageUrl));
    }
  };

  const handleGenerateContent = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/admin/packages/generate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          type,
          destination,
          nights,
          days,
          startingPrice,
          category,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem("admin_token");
        router.push("/admin");
        return;
      }

      const data = await response.json();
      if (response.ok) {
        setGeneratedContent(data.content);
        setEditableContent(data.content);
        setStep(2);
      } else {
        setError(data.error || "Failed to generate content");
      }
    } catch (err) {
      setError("Failed to generate content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);

    // Create preview URLs
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleSubmit = async () => {
    if (!editableContent) return;

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("admin_token");

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("title", editableContent.title);
      formData.append("shortDescription", editableContent.shortDescription);
      formData.append("description", editableContent.description);
      formData.append("type", type);
      formData.append("destination", destination);
      formData.append("nights", nights.toString());
      formData.append("days", days.toString());
      formData.append("startingPrice", startingPrice.toString());
      formData.append("category", category);
      formData.append("inclusions", JSON.stringify(editableContent.inclusions));
      formData.append("exclusions", JSON.stringify(editableContent.exclusions));
      formData.append("tags", JSON.stringify(editableContent.tags));

      // Add image files
      imageFiles.forEach((file, index) => {
        formData.append(`image${index}`, file);
      });

      const response = await fetch("/api/admin/packages", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setCreatedPackageId(data.package.id);
        // Generate social media posts
        await generateSocialMediaPosts(data.package);
        setStep(4);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to create package");
      }
    } catch (err) {
      setError("Failed to create package. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateSocialMediaPosts = async (packageData: any) => {
    setGeneratingPosts(true);
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(
        "/api/admin/packages/generate-social-posts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            packageId: packageData.id,
            title: packageData.title,
            description: packageData.shortDescription,
            fullDescription: packageData.description,
            destination: packageData.destination,
            price: packageData.startingPrice,
            nights: packageData.nights,
            days: packageData.days,
            type: packageData.type || type,
            category: packageData.category || category,
            inclusions: JSON.parse(packageData.inclusions || "[]"),
            tags: JSON.parse(packageData.tags || "[]"),
            adjustmentPrompt: adjustmentPrompt,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSocialMediaPosts(data.posts);
      }
    } catch (err) {
      console.error("Failed to generate social media posts:", err);
    } finally {
      setGeneratingPosts(false);
    }
  };

  const handleRegeneratePosts = async () => {
    if (!createdPackageId || !editableContent) return;
    await generateSocialMediaPosts({
      id: createdPackageId,
      title: editableContent.title,
      shortDescription: editableContent.shortDescription,
      description: editableContent.description,
      destination: destination,
      startingPrice: startingPrice,
      nights: nights,
      days: days,
      type: type,
      category: category,
      inclusions: JSON.stringify(editableContent.inclusions),
      tags: JSON.stringify(editableContent.tags),
    });
  };

  const handleFinishAndPublish = () => {
    router.push("/admin/dashboard");
  };

  // Auto-load Disney images when reaching step 3
  useEffect(() => {
    if (step === 3 && disneyImages.length === 0 && !scanningImages) {
      handleScanDisneyImages();
    }
  }, [step]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="text-blue-600 hover:text-blue-800"
            >
              ← Back to Dashboard
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                Add New Vacation Package
              </h1>
              <p className="text-gray-600">
                Step {step} of 4 -{" "}
                {step === 1
                  ? "Basic Info"
                  : step === 2
                    ? "Review Content"
                    : step === 3
                      ? "Upload Images"
                      : "Social Media Posts"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Step 1: Basic Info & AI Prompt */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Tell the AI about the vacation package
              </h2>
              <button
                onClick={handleScanDisney}
                disabled={scanningDisney}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
              >
                {scanningDisney ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Scanning Disney...
                  </span>
                ) : (
                  "🏰 Scan Disney Offers"
                )}
              </button>
            </div>

            <div className="space-y-6">
              {/* Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe the vacation package *
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Example: 5-day Disney World vacation with Magic Kingdom, Epcot, park hopper tickets, resort stay at Contemporary, character dining experiences, and FastPass access. Perfect for families with young children."
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  The AI will use this to generate professional descriptions,
                  inclusions, and marketing content
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Package Type *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="disney-park">Disney Park</option>
                    <option value="disney-cruise">Disney Cruise</option>
                    <option value="cruise">Regular Cruise</option>
                    <option value="combo">Combo Package</option>
                  </select>
                </div>

                {/* Destination */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination *
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Walt Disney World, Orlando"
                    required
                  />
                </div>

                {/* Nights */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nights
                  </label>
                  <input
                    type="number"
                    value={nights}
                    onChange={(e) => setNights(parseInt(e.target.value))}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Days */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Days
                  </label>
                  <input
                    type="number"
                    value={days}
                    onChange={(e) => setDays(parseInt(e.target.value))}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Starting Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Starting Price ($) *
                  </label>
                  <input
                    type="number"
                    value={startingPrice}
                    onChange={(e) => setStartingPrice(parseInt(e.target.value))}
                    min="0"
                    step="50"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="family">Family</option>
                    <option value="luxury">Luxury</option>
                    <option value="budget">Budget</option>
                    <option value="adventure">Adventure</option>
                    <option value="romantic">Romantic</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleGenerateContent}
                  disabled={loading || !prompt || !destination}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      AI is generating content...
                    </span>
                  ) : (
                    "Generate Content with AI →"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Review & Edit AI Content */}
        {step === 2 && editableContent && (
          <div className="space-y-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🤖</span>
                <h3 className="text-lg font-semibold text-gray-900">
                  AI Generated Content
                </h3>
              </div>
              <p className="text-gray-700">
                Review and edit the content below. The AI has created
                professional descriptions based on your input.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Package Title
                  </label>
                  <input
                    type="text"
                    value={editableContent.title}
                    onChange={(e) =>
                      setEditableContent({
                        ...editableContent,
                        title: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description
                  </label>
                  <textarea
                    value={editableContent.shortDescription}
                    onChange={(e) =>
                      setEditableContent({
                        ...editableContent,
                        shortDescription: e.target.value,
                      })
                    }
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Full Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Description
                  </label>
                  <textarea
                    value={editableContent.description}
                    onChange={(e) =>
                      setEditableContent({
                        ...editableContent,
                        description: e.target.value,
                      })
                    }
                    rows={8}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Inclusions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inclusions (one per line)
                  </label>
                  <textarea
                    value={editableContent.inclusions.join("\n")}
                    onChange={(e) =>
                      setEditableContent({
                        ...editableContent,
                        inclusions: e.target.value
                          .split("\n")
                          .filter((i) => i.trim()),
                      })
                    }
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Exclusions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exclusions (one per line)
                  </label>
                  <textarea
                    value={editableContent.exclusions.join("\n")}
                    onChange={(e) =>
                      setEditableContent({
                        ...editableContent,
                        exclusions: e.target.value
                          .split("\n")
                          .filter((i) => i.trim()),
                      })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={editableContent.tags.join(", ")}
                    onChange={(e) =>
                      setEditableContent({
                        ...editableContent,
                        tags: e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter((t) => t),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Continue to Images →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Upload Images */}
        {step === 3 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Upload Vacation Images
            </h2>

            <div className="space-y-6">
              {scanningImages && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                  <p className="text-purple-700 font-medium">
                    Scanning Disney website for vacation images...
                  </p>
                  <p className="text-purple-600 text-sm">
                    This may take a moment
                  </p>
                </div>
              )}

              {!scanningImages && disneyImages.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-700 font-medium">
                    ✅ Found {disneyImages.length} Disney images!
                  </p>
                  <p className="text-green-600 text-sm">
                    Click any image below to add it, or upload your own
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Images (up to 5)
                </label>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  The first image will be the primary image shown on listings
                </p>
              </div>

              {/* Disney Images Grid */}
              {!scanningImages && disneyImages.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold text-gray-800 mb-3">
                    Disney Vacation Images
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {disneyImages.map((image, index) => (
                      <div
                        key={index}
                        className="relative border border-gray-200 rounded-lg overflow-hidden hover:border-purple-500 hover:shadow-lg transition cursor-pointer"
                        onClick={() => handleSelectDisneyImage(image.url)}
                      >
                        <div className="relative h-32 bg-gray-100">
                          <img
                            src={image.url}
                            alt={image.description}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.jpg";
                            }}
                          />
                          {downloadingImages.includes(image.url) && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            </div>
                          )}
                        </div>
                        <div className="p-2 bg-white">
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {image.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Uploaded Image Previews */}
              {imagePreviews.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold text-gray-800 mb-3">
                    Selected Images
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        {index === 0 && (
                          <span className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating Package...
                    </span>
                  ) : (
                    "Create Package"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Social Media Posts */}
        {step === 4 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              🎉 Package Created Successfully!
            </h2>
            <p className="text-gray-600 mb-6">
              Choose a social media post to share your new vacation package
            </p>

            {generatingPosts ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">
                  Generating social media posts...
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Social Media Post Options */}
                <div className="space-y-4">
                  {socialMediaPosts.map((post, index) => (
                    <div
                      key={index}
                      className={`border-2 rounded-lg p-6 cursor-pointer transition ${
                        selectedPostIndex === index
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                      onClick={() => setSelectedPostIndex(index)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">
                            {post.platform === "instagram"
                              ? "📷"
                              : post.platform === "facebook"
                                ? "📘"
                                : "🐦"}
                          </span>
                          <h3 className="font-bold text-gray-900 capitalize">
                            {post.platform} Post Option {index + 1}
                          </h3>
                        </div>
                        {selectedPostIndex === index && (
                          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-gray-800 whitespace-pre-line mb-3">
                        {post.text}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {post.hashtags.map((tag, i) => (
                          <span
                            key={i}
                            className="text-blue-600 text-sm font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Adjustment Prompt */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Want to adjust the posts? Describe what you&apos;d like
                    changed:
                  </label>
                  <textarea
                    value={adjustmentPrompt}
                    onChange={(e) => setAdjustmentPrompt(e.target.value)}
                    placeholder="E.g., 'Make it more exciting and fun' or 'Focus more on family-friendly aspects'"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                  <button
                    onClick={handleRegeneratePosts}
                    disabled={generatingPosts || !adjustmentPrompt.trim()}
                    className="mt-3 bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {generatingPosts
                      ? "Generating..."
                      : "🔄 Generate New Options"}
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          "Are you sure? You'll need to re-upload images."
                        )
                      ) {
                        setStep(3);
                      }
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    ← Back
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={handleFinishAndPublish}
                      className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
                    >
                      Skip Social Posts
                    </button>
                    <button
                      onClick={() => {
                        if (selectedPostIndex !== null) {
                          const selectedPost =
                            socialMediaPosts[selectedPostIndex];
                          navigator.clipboard.writeText(
                            `${selectedPost.text}\n\n${selectedPost.hashtags.join(" ")}`
                          );
                          alert("Social media post copied to clipboard!");
                        }
                        handleFinishAndPublish();
                      }}
                      disabled={selectedPostIndex === null}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      📋 Copy & Finish
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Disney Offers Modal */}
        {showDisneyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Disney Special Offers Found
                  </h2>
                  <button
                    onClick={() => setShowDisneyModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-gray-600 mt-1">
                  {disneyOffers.length} new offer(s) found. Click to auto-fill
                  the form.
                </p>
              </div>

              <div className="p-6 space-y-4">
                {disneyOffers.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 text-lg">
                      ✅ All Disney offers are already in your system!
                    </p>
                    <button
                      onClick={() => setShowDisneyModal(false)}
                      className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  disneyOffers.map((offer, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:border-purple-500 hover:shadow-lg transition cursor-pointer"
                      onClick={() => handleSelectDisneyOffer(offer)}
                    >
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {offer.title}
                      </h3>
                      <p className="text-gray-700 mb-3">{offer.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {offer.priceInfo && (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                            {offer.priceInfo}
                          </span>
                        )}
                        {offer.duration && (
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                            {offer.duration}
                          </span>
                        )}
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                          {offer.destination}
                        </span>
                      </div>
                      {offer.highlights.length > 0 && (
                        <div className="text-sm text-gray-600">
                          <strong>Highlights:</strong>
                          <ul className="list-disc list-inside mt-1">
                            {offer.highlights
                              .slice(0, 3)
                              .map((highlight, i) => (
                                <li key={i}>{highlight}</li>
                              ))}
                          </ul>
                        </div>
                      )}
                      <div className="mt-3 text-purple-600 font-semibold text-sm">
                        Click to use this offer →
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
