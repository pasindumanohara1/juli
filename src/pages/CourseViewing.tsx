import React, { useEffect, useRef, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import LiquidBackground from "@/components/LiquidBackground";
import GlassCard from "@/components/GlassCard";
import LiquidButton from "@/components/LiquidButton";
import { supabase } from "@/lib/supabaseClient";
import { ArrowLeft, AlertTriangle, Play, Download } from "lucide-react";

type Course = {
  id: string;
  name: string;
  description: string | null;
  instructor_name: string | null;
  level: string | null;
  category: string | null;
  thumbnail_url: string | null;
  rate: number | null;
  students_enrolled: number | null;
  is_paid: boolean | null;
};

type DpVideo = {
  id: string;
  thumbnail_url: string | null;
  video_url: string;
  video_no: number | null;
  stream: string | null;
  subject: string | null;
  course_id: string;
};

type TopicWithVideos = {
  id: string;
  title: string;
  order_index: number | null;
  videos: {
    id: string;
    title: string;
    instructor: string | null;
    video_url: string | null;
    duration: number | null;
    thumbnail_url: string | null;
    order_index: number | null;
    is_free: boolean | null;
  }[];
};

type Resource = {
  id: string;
  name: string | null;
  file_url: string | null;
  type: string | null;
};

type Review = {
  id: string;
  user_id: string;
  user_name: string | null;
  rating: number;
  comment: string;
  created_at: string;
};

const CourseViewing: React.FC = () => {
  const params = useParams();
  const id = params.id as string | undefined;
  const [searchParams, setSearchParams] = useSearchParams();
  const deepTopicId = searchParams.get("topic") || undefined;
  const deepVideoId = searchParams.get("video") || undefined;

  const [course, setCourse] = useState<Course | null>(null);
  const [videos, setVideos] = useState<DpVideo[]>([]);
  const [topics, setTopics] = useState<TopicWithVideos[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [activeTab, setActiveTab] = useState<'videos' | 'resources' | 'reviews'>(
    (searchParams.get('tab') as 'videos' | 'resources' | 'reviews') || 'videos'
  );
  const [topicSearch, setTopicSearch] = useState('');
  const [resourceSearch, setResourceSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openTopics, setOpenTopics] = useState<Record<string, boolean>>({});
  const highlightedRef = useRef<HTMLDivElement | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<{ id: string; title: string; url: string | null } | null>(null);

  // Normalize YouTube URL formats
  const normalizeVideoUrl = (raw: string | null | undefined) => {
    if (!raw) return null;
    try {
      const u = new URL(raw);
      if (u.hostname === "youtu.be") {
        const id = u.pathname.replace("/", "");
        return id ? `https://www.youtube.com/embed/${id}?modestbranding=1&rel=0&playsinline=1` : null;
      }
      if (u.hostname.includes("youtube.com")) {
        if (u.pathname.startsWith("/shorts/")) {
          const id = u.pathname.split("/shorts/")[1]?.split("?")[0];
          return id ? `https://www.youtube.com/embed/${id}?modestbranding=1&rel=0&playsinline=1` : null;
        }
        const vid = u.searchParams.get("v");
        return vid ? `https://www.youtube.com/embed/${vid}?modestbranding=1&rel=0&playsinline=1` : null;
      }
      return raw;
    } catch {
      return raw;
    }
  };

  useEffect(() => {
    const loadCourseData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        
        // Fetch course details
        const { data: courseData } = await supabase
          .from("courses")
          .select("*")
          .eq("id", id)
          .single();
        setCourse(courseData as Course);

        // Fetch topics with videos
        const { data: topicsData } = await supabase
          .from("topics")
          .select("*, videos(*)")
          .eq("course_id", id)
          .order("order_index", { ascending: true });
        setTopics(topicsData as TopicWithVideos[]);

        // Fetch DP education videos
        const { data: vids } = await supabase
          .from("dpeducationvideos")
          .select("*")
          .eq("course_id", id)
          .order("video_no", { ascending: true });
        setVideos(vids as DpVideo[]);

        // Fetch resources
        const topicIds = topicsData?.map(t => t.id) || [];
        if (topicIds.length > 0) {
          const { data: res } = await supabase
            .from("resources")
            .select("*")
            .in("topic_id", topicIds);
          setResources(res as Resource[]);
        }

      } catch (e: any) {
        setError(e.message || "Failed to load course");
      } finally {
        setLoading(false);
      }
    };

    loadCourseData();
  }, [id]);

  const submitReview = () => {
    if (!newReview.rating || !newReview.comment.trim()) return;
    
    setIsSubmittingReview(true);
    try {
      const mockReview = {
        id: Date.now().toString(),
        user_id: 'mock-user',
        user_name: 'Demo User',
        rating: newReview.rating,
        comment: newReview.comment.trim(),
        created_at: new Date().toISOString()
      };
      setReviews([mockReview, ...reviews]);
      setNewReview({ rating: 0, comment: '' });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen pt-24">
      <LiquidBackground />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/courses">
            <LiquidButton variant="secondary" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Courses
            </LiquidButton>
          </Link>
        </div>

        {loading && (
          <div className="space-y-6">
            {/* Loading skeletons */}
          </div>
        )}

        {error && !loading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {!loading && !error && course && (
          <>
            <GlassCard className="p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-72 h-44 rounded-xl overflow-hidden">
                  <img
                    src={course.thumbnail_url || "https://placehold.co/600x400?text=Course"}
                    alt={course.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
                      {course.category || "Uncategorized"}
                    </span>
                    {course.level && (
                      <span className="text-xs font-medium text-ocean-700 bg-ocean-50 px-2 py-1 rounded-full border border-ocean-100">
                        {course.level}
                      </span>
                    )}
                    <span className="text-xs text-ocean-500">
                      {(course.students_enrolled || 0).toLocaleString()} students
                    </span>
                    <span className="text-xs text-ocean-500">
                      {course.is_paid ? "Paid" : "Free"}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-ocean-700 mb-2">{course.name}</h1>
                  {course.instructor_name && (
                    <p className="text-ocean-500 mb-2">By {course.instructor_name}</p>
                  )}
                  <p className="text-ocean-600">{course.description}</p>
                </div>
              </div>
            </GlassCard>

            <div className="mb-3">
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveTab('videos')}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                    activeTab === 'videos' ? "bg-ocean-600 text-white" : "bg-white/60 text-ocean-700"
                  }`}
                >
                  Videos
                </button>
                <button
                  onClick={() => setActiveTab('resources')}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                    activeTab === 'resources' ? "bg-ocean-600 text-white" : "bg-white/60 text-ocean-700"
                  }`}
                >
                  Resources
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                    activeTab === 'reviews' ? "bg-ocean-600 text-white" : "bg-white/60 text-ocean-700"
                  }`}
                >
                  Reviews
                </button>
              </div>
            </div>

            {activeTab === 'videos' && selectedVideo && (
              <GlassCard className="p-4 mb-8">
                <div className="max-w-7xl mx-auto">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h4 className="text-xl md:text-2xl font-semibold text-ocean-700 line-clamp-2">
                      Now Playing: {selectedVideo.title}
                    </h4>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedVideo(null)}
                        className="text-sm md:text-base text-ocean-600 hover:text-ocean-800 underline"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                  {selectedVideo.url && (
                    <div className="relative w-full rounded-xl overflow-hidden shadow-lg" style={{ aspectRatio: "16/9" }}>
                      <iframe
                        src={normalizeVideoUrl(selectedVideo.url) || ''}
                        title={selectedVideo.title}
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>
                  )}
                </div>
              </GlassCard>
            )}

            {activeTab === 'videos' ? (
              <div className="space-y-6">
                {/* Videos content */}
              </div>
            ) : activeTab === 'resources' ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.map(r => (
                  <GlassCard key={r.id} className="p-5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-ocean-700">{r.name || "Resource"}</div>
                      <div className="text-sm text-ocean-500">{r.type?.toUpperCase() || "FILE"}</div>
                    </div>
                    {r.file_url ? (
                      <a href={r.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-ocean-700 hover:underline">
                        <Download className="w-4 h-4" /> Open
                      </a>
                    ) : (
                      <span className="text-xs text-ocean-400">No link</span>
                    )}
                  </GlassCard>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <GlassCard className="p-6">
                  <h3 className="text-xl font-semibold text-ocean-700 mb-4">Leave a Review</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-ocean-600 mb-1">Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            className="text-2xl"
                            onClick={() => setNewReview({ ...newReview, rating: star })}
                          >
                            {star <= newReview.rating ? '★' : '☆'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ocean-600 mb-1">Review</label>
                      <textarea
                        className="w-full p-3 border border-ocean-200 rounded-lg focus:ring-2 focus:ring-ocean-400 focus:border-transparent"
                        rows={4}
                        value={newReview.comment}
                        onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                        placeholder="Share your experience with this course..."
                      />
                    </div>
                    <button
                      className="bg-ocean-600 text-white px-4 py-2 rounded-lg hover:bg-ocean-700 transition"
                      onClick={submitReview}
                      disabled={isSubmittingReview}
                    >
                      {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                </GlassCard>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-ocean-700">Course Reviews</h3>
                  {reviews.length === 0 ? (
                    <GlassCard className="p-6 text-center text-ocean-500">
                      No reviews yet. Be the first to share your thoughts!
                    </GlassCard>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map(review => (
                        <GlassCard key={review.id} className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="bg-ocean-100 text-ocean-700 rounded-full w-10 h-10 flex items-center justify-center font-semibold">
                              {review.user_name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="font-medium text-ocean-700">{review.user_name || 'Anonymous'}</div>
                                <div className="text-sm text-ocean-500">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="flex gap-1 text-yellow-500 mb-2">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                                ))}
                              </div>
                              <p className="text-ocean-600">{review.comment}</p>
                            </div>
                          </div>
                        </GlassCard>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CourseViewing;
