import React, { useEffect, useMemo, useState } from "react";
import GlassCard from "@/components/GlassCard";
import LiquidButton from "@/components/LiquidButton";
import { supabase } from "@/lib/supabaseClient";
import { AlertTriangle, Trash2, RefreshCcw, Mail, Shield, PlusCircle } from "lucide-react";

type Post = {
  id: string;
  author_id: string | null;
  content: string | null;
  image_url: string | null;
  category: string | null;
  likes: number | null;
  reports: number | null;
  created_at: string | null;
};

type ContactMessage = {
  id: string;
  name: string | null;
  email: string | null;
  subject: string | null;
  message: string | null;
  created_at: string | null;
};

const TABS = ["Reported Posts", "Feedback", "Add Course"] as const;
type TabKey = typeof TABS[number];

const Admin: React.FC = () => {
  // Gate
  const [unlocked, setUnlocked] = useState<boolean>(false);
  const [attempt, setAttempt] = useState<string>("");

  const secret = import.meta.env.VITE_ADMIN_SECRET as string | undefined;

  useEffect(() => {
    // persist unlocked in sessionStorage for convenience during dev
    const saved = sessionStorage.getItem("admin_unlocked");
    if (saved === "true") setUnlocked(true);
  }, []);

  const tryUnlock = () => {
    if (!secret) {
      alert("Admin secret is not configured. Please set VITE_ADMIN_SECRET in .env and restart dev server.");
      return;
    }
    if (attempt === secret) {
      setUnlocked(true);
      sessionStorage.setItem("admin_unlocked", "true");
    } else {
      alert("Incorrect admin password.");
    }
  };

  // Tabs
  const [tab, setTab] = useState<TabKey>("Reported Posts");

  // Reported posts state
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsError, setPostsError] = useState<string | null>(null);

  // Feedback state
  const [loadingFeedback, setLoadingFeedback] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<ContactMessage[]>([]);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Add Course state with nested Topics, Videos, Resources
  const [creating, setCreating] = useState<boolean>(false);
  const [courseName, setCourseName] = useState<string>("");
  const [courseDesc, setCourseDesc] = useState<string>("");
  const [courseCategory, setCourseCategory] = useState<string>("Other");
  const [courseInstructor, setCourseInstructor] = useState<string>("");
  const [courseLevel, setCourseLevel] = useState<string>("Beginner");
  const [courseStream, setCourseStream] = useState<string>("");
  const [courseThumbnail, setCourseThumbnail] = useState<string>("");
  const [courseIsPaid, setCourseIsPaid] = useState<boolean>(false);
  const [courseLanguage, setCourseLanguage] = useState<string>("English");

  type NewVideo = {
    title: string;
    instructor: string;
    video_url: string;
    duration?: number | null;
    thumbnail_url?: string | null;
    order_index?: number | null;
    is_free?: boolean | null;
  };

  type NewResource = {
    name: string;
    file_url: string; // only URL per user spec
  };

  type NewTopic = {
    title: string;
    order_index?: number | null;
    videos: NewVideo[];
    resources: NewResource[];
  };

  const [topicsDraft, setTopicsDraft] = useState<NewTopic[]>([
    { title: "", order_index: null, videos: [], resources: [] },
  ]);

  function addTopic() {
    setTopicsDraft((prev) => [...prev, { title: "", order_index: null, videos: [], resources: [] }]);
  }
  function removeTopic(idx: number) {
    setTopicsDraft((prev) => prev.filter((_, i) => i !== idx));
  }
  function updateTopic(idx: number, patch: Partial<NewTopic>) {
    setTopicsDraft((prev) => prev.map((t, i) => (i === idx ? { ...t, ...patch } : t)));
  }

  function addVideo(tIdx: number) {
    setTopicsDraft((prev) =>
      prev.map((t, i) => {
        if (i !== tIdx) return t;
        const last = t.videos[t.videos.length - 1];
        const nextOrder =
          t.videos.length === 0
            ? 1
            : typeof (last?.order_index ?? null) === "number"
            ? (last!.order_index as number) + 1
            : t.videos.length + 1;
        return {
          ...t,
          videos: [
            ...t.videos,
            {
              title: last?.title ?? "",
              instructor: last?.instructor ?? "",
              video_url: last?.video_url ?? "",
              duration: last?.duration ?? null,
              thumbnail_url: last?.thumbnail_url ?? "",
              order_index: nextOrder,
              is_free: last?.is_free ?? true,
            },
          ],
        };
      })
    );
  }
  function removeVideo(tIdx: number, vIdx: number) {
    setTopicsDraft((prev) =>
      prev.map((t, i) => (i === tIdx ? { ...t, videos: t.videos.filter((_, j) => j !== vIdx) } : t))
    );
  }
  function updateVideo(tIdx: number, vIdx: number, patch: Partial<NewVideo>) {
    setTopicsDraft((prev) =>
      prev.map((t, i) =>
        i === tIdx
          ? { ...t, videos: t.videos.map((v, j) => (j === vIdx ? { ...v, ...patch } : v)) }
          : t
      )
    );
  }

  function addResource(tIdx: number) {
    setTopicsDraft((prev) =>
      prev.map((t, i) => (i === tIdx ? { ...t, resources: [...t.resources, { name: "", file_url: "" }] } : t))
    );
  }
  function removeResource(tIdx: number, rIdx: number) {
    setTopicsDraft((prev) =>
      prev.map((t, i) => (i === tIdx ? { ...t, resources: t.resources.filter((_, j) => j !== rIdx) } : t))
    );
  }
  function updateResource(tIdx: number, rIdx: number, patch: Partial<NewResource>) {
    setTopicsDraft((prev) =>
      prev.map((t, i) =>
        i === tIdx
          ? { ...t, resources: t.resources.map((r, j) => (j === rIdx ? { ...r, ...patch } : r)) }
          : t
      )
    );
  }

  const categories = ["Math", "Science", "Commerce", "ICT", "Arts", "Other"];
  const levels = ["Beginner", "Ordinary", "Advanced", "Higher Education"];
  const languages = ["English", "Sri Lanka", "India"];

  const tabContent = useMemo(() => tab, [tab]);

  async function loadReportedPosts() {
    try {
      setLoadingPosts(true);
      setPostsError(null);
      // Show posts with reports > 0 ordered by highest reports first
      const { data, error } = await supabase
        .from("posts")
        .select("id, author_id, content, image_url, category, likes, reports, created_at")
        .gt("reports", 0)
        .order("reports", { ascending: false });

      if (error) throw new Error(error.message);
      setPosts((data ?? []) as Post[]);
    } catch (e: any) {
      setPostsError(e?.message ?? "Failed to load reported posts");
    } finally {
      setLoadingPosts(false);
    }
  }

  async function loadFeedback() {
    try {
      setLoadingFeedback(true);
      setFeedbackError(null);
      const { data, error } = await supabase
        .from("contact_messages")
        .select("id, name, email, subject, message, created_at")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw new Error(error.message);
      setFeedback((data ?? []) as ContactMessage[]);
    } catch (e: any) {
      setFeedbackError(e?.message ?? "Failed to load feedback");
    } finally {
      setLoadingFeedback(false);
    }
  }

  useEffect(() => {
    if (!unlocked) return;
    // Load data for active tab
    if (tabContent === "Reported Posts") {
      loadReportedPosts();
    } else if (tabContent === "Feedback") {
      loadFeedback();
    }
  }, [unlocked, tabContent]);

  // Actions
  async function resetReports(id: string) {
    const ok = confirm("Reset reports for this post?");
    if (!ok) return;
    const { error } = await supabase.from("posts").update({ reports: 0 }).eq("id", id);
    if (error) {
      alert("Failed to reset reports: " + error.message);
      return;
    }
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, reports: 0 } : p)));
  }

  async function deletePost(id: string) {
    const ok = confirm("Delete this post? This cannot be undone.");
    if (!ok) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) {
      alert("Failed to delete post: " + error.message);
      return;
    }
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleCreateCourse(e: React.FormEvent) {
    e.preventDefault();
    if (!courseName.trim()) {
      alert("Course name is required");
      return;
    }
    try {
      setCreating(true);
      // 1) Create course
      const { data: cdata, error: cerr } = await supabase
        .from("courses")
        .insert([
          {
            name: courseName.trim(),
            description: courseDesc || null,
            category: courseCategory,
            instructor_name: courseInstructor || null,
            level: courseLevel,
            stream: courseStream || null,
            thumbnail_url: courseThumbnail || null,
            is_paid: courseIsPaid,
            language: courseLanguage,
            rate: 0,
            students_enrolled: 0,
          },
        ])
        .select("id")
        .single();

      if (cerr) throw new Error(cerr.message);
      const courseId = cdata?.id as string | undefined;
      if (!courseId) throw new Error("Failed to retrieve created course id.");

      // 2) Insert topics
      const preparedTopics = topicsDraft
        .filter((t) => t.title.trim().length > 0)
        .map((t) => ({
          course_id: courseId,
          title: t.title.trim(),
          order_index: t.order_index ?? null,
        }));
      let topicIds: string[] = [];
      if (preparedTopics.length > 0) {
        const { data: tdata, error: terr } = await supabase
          .from("topics")
          .insert(preparedTopics)
          .select("id,title")
          .order("id", { ascending: true }); // order to align with returned rows
        if (terr) throw new Error(terr.message);
        // Map back by title order (best effort for this client-side draft)
        topicIds = (tdata ?? []).map((row: any) => row.id as string);
      }

      // 3) Insert videos/resources per topic
      // We need to fetch topics again with course_id to ensure order if counts mismatch
      // Or rely on index order; safer: fetch back topics by course_id and title match.
      let topicsFromDb: { id: string; title: string }[] = [];
      if (preparedTopics.length > 0) {
        const { data: tlist, error: lerr } = await supabase
          .from("topics")
          .select("id,title")
          .eq("course_id", courseId)
          .order("order_index", { ascending: true })
          .order("title", { ascending: true, nullsFirst: true });
        if (lerr) throw new Error(lerr.message);
        topicsFromDb = (tlist ?? []) as any[];
      }

      // Build and insert per-topic videos and resources using title matching (since we don't have IDs in draft)
      for (const tDraft of topicsDraft) {
        const tTitle = (tDraft.title ?? "").trim();
        if (!tTitle) continue;
        const match = topicsFromDb.find((t) => t.title === tTitle);
        if (!match) continue;
        const topicId = match.id;

        const vids = (tDraft.videos ?? [])
          .filter((v) => (v.title?.trim() || v.video_url?.trim()))
          .map((v) => ({
            topic_id: topicId,
            title: (v.title ?? "").trim(),
            instructor: (v.instructor ?? "").trim() || null,
            video_url: (v.video_url ?? "").trim(),
            duration: v.duration ?? null,
            thumbnail_url: (v.thumbnail_url ?? "").trim() || null,
            order_index: v.order_index ?? null,
            is_free: v.is_free ?? true,
          }));
        if (vids.length > 0) {
          const { error: verr } = await supabase.from("videos").insert(vids);
          if (verr) throw new Error(`Videos insert failed for topic "${tTitle}": ${verr.message}`);
        }

        const res = (tDraft.resources ?? [])
          .filter((r) => (r.name?.trim() || r.file_url?.trim()))
          .map((r) => ({
            topic_id: topicId,
            name: (r.name ?? "").trim(),
            file_url: (r.file_url ?? "").trim(), // only URL as specified
          }));
        if (res.length > 0) {
          const { error: rerr } = await supabase.from("resources").insert(res);
          if (rerr) throw new Error(`Resources insert failed for topic "${tTitle}": ${rerr.message}`);
        }
      }

      alert("Course, topics, videos, and resources created.");
      // Reset all fields
      setCourseName("");
      setCourseDesc("");
      setCourseInstructor("");
      setCourseStream("");
      setCourseThumbnail("");
      setCourseIsPaid(false);
      setCourseCategory("Other");
      setCourseLevel("Beginner");
      setCourseLanguage("English");
      setTopicsDraft([{ title: "", order_index: null, videos: [], resources: [] }]);
    } catch (e: any) {
      alert(e?.message ?? "Failed to create course with details");
    } finally {
      setCreating(false);
    }
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-ocean-600" />
              <h1 className="text-xl font-semibold text-ocean-700">Admin Access</h1>
            </div>
            <p className="text-sm text-ocean-600 mb-4">
              Enter the admin password to access moderation and management tools.
            </p>
            <input
              type="password"
              value={attempt}
              onChange={(e) => setAttempt(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-2 border border-ocean-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-400 mb-3"
            />
            <LiquidButton variant="primary" onClick={tryUnlock}>
              Unlock
            </LiquidButton>
            {!secret && (
              <div className="mt-3 text-xs text-red-600">
                Warning: VITE_ADMIN_SECRET is not set. Add it to .env and restart the dev server.
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-ocean-700">Admin</h1>
          <p className="text-ocean-500">Moderate reports, review feedback, and add new courses.</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-6">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                tab === t
                  ? "bg-ocean-600 text-white border-ocean-600"
                  : "bg-white/70 text-ocean-700 border-ocean-200 hover:bg-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Reported Posts */}
        {tab === "Reported Posts" && (
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h2 className="text-xl font-semibold text-ocean-700">Reported Posts</h2>
              </div>
              <LiquidButton variant="secondary" onClick={loadReportedPosts}>
                <RefreshCcw className="w-4 h-4 mr-2" />
                Refresh
              </LiquidButton>
            </div>

            {loadingPosts && <div className="text-ocean-500">Loading...</div>}
            {postsError && <div className="text-red-600">{postsError}</div>}

            {!loadingPosts && !postsError && posts.length === 0 && (
              <div className="text-ocean-500">No reported posts found.</div>
            )}

            {!loadingPosts && !postsError && posts.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {posts.map((p) => (
                  <div key={p.id} className="rounded-xl bg-white/70 border border-ocean-100 p-4">
                    <div className="text-xs text-ocean-500 mb-1">{p.created_at ?? ""}</div>
                    <div className="font-semibold text-ocean-700 mb-1 line-clamp-2">
                      {(p.content ?? "").slice(0, 140) || "(no text)"}
                    </div>
                    {p.image_url && (
                      <div className="h-36 rounded-lg overflow-hidden mb-2">
                        <img src={p.image_url} alt="post" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm text-ocean-600">
                      <span>Reports: {p.reports ?? 0}</span>
                      <span>Likes: {p.likes ?? 0}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => resetReports(p.id)}
                        className="inline-flex items-center gap-1 text-ocean-700 hover:underline"
                      >
                        <RefreshCcw className="w-4 h-4" />
                        Reset
                      </button>
                      <button
                        onClick={() => deletePost(p.id)}
                        className="inline-flex items-center gap-1 text-red-600 hover:underline"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        )}

        {/* Feedback */}
        {tab === "Feedback" && (
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-ocean-600" />
                <h2 className="text-xl font-semibold text-ocean-700">Customer Feedback</h2>
              </div>
              <LiquidButton variant="secondary" onClick={loadFeedback}>
                <RefreshCcw className="w-4 h-4 mr-2" />
                Refresh
              </LiquidButton>
            </div>

            {loadingFeedback && <div className="text-ocean-500">Loading...</div>}
            {feedbackError && <div className="text-red-600">{feedbackError}</div>}

            {!loadingFeedback && !feedbackError && feedback.length === 0 && (
              <div className="text-ocean-500">No feedback found.</div>
            )}

            {!loadingFeedback && !feedbackError && feedback.length > 0 && (
              <div className="space-y-4">
                {feedback.map((f) => (
                  <div key={f.id} className="rounded-xl bg-white/70 border border-ocean-100 p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-ocean-700">{f.subject ?? "(no subject)"}</div>
                      <div className="text-xs text-ocean-500">{f.created_at ?? ""}</div>
                    </div>
                    <div className="text-sm text-ocean-600 mt-1">
                      From: {f.name ?? "Unknown"} {f.email ? `(<a href="mailto:${f.email}" class="underline">${f.email}</a>)` : ""}
                    </div>
                    <div className="text-ocean-700 mt-2 whitespace-pre-wrap">{f.message ?? ""}</div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        )}

        {/* Add Course */}
        {tab === "Add Course" && (
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <PlusCircle className="w-5 h-5 text-teal-600" />
              <h2 className="text-xl font-semibold text-ocean-700">Add Course</h2>
            </div>
            <p className="text-sm text-ocean-600 mb-4">
              Create the course and optionally add topics, per-topic videos, and resource links in one flow.
            </p>

            <form onSubmit={handleCreateCourse} className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-ocean-700 mb-1">Name</label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full px-4 py-2 border border-ocean-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-400"
                  placeholder="Course title"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-ocean-700 mb-1">Description</label>
                <textarea
                  value={courseDesc}
                  onChange={(e) => setCourseDesc(e.target.value)}
                  className="w-full px-4 py-2 border border-ocean-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-400"
                  placeholder="A short blurb..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ocean-700 mb-1">Category</label>
                <select
                  value={courseCategory}
                  onChange={(e) => setCourseCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-ocean-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-400"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ocean-700 mb-1">Level</label>
                <select
                  value={courseLevel}
                  onChange={(e) => setCourseLevel(e.target.value)}
                  className="w-full px-4 py-2 border border-ocean-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-400"
                >
                  {levels.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ocean-700 mb-1">Instructor Name</label>
                <input
                  type="text"
                  value={courseInstructor}
                  onChange={(e) => setCourseInstructor(e.target.value)}
                  className="w-full px-4 py-2 border border-ocean-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-400"
                  placeholder="Instructor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ocean-700 mb-1">Stream</label>
                <input
                  type="text"
                  value={courseStream}
                  onChange={(e) => setCourseStream(e.target.value)}
                  className="w-full px-4 py-2 border border-ocean-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-400"
                  placeholder="e.g., Science / Commerce / Arts"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-ocean-700 mb-1">Thumbnail URL</label>
                <input
                  type="text"
                  value={courseThumbnail}
                  onChange={(e) => setCourseThumbnail(e.target.value)}
                  className="w-full px-4 py-2 border border-ocean-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-400"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ocean-700 mb-1">Language</label>
                <select
                  value={courseLanguage}
                  onChange={(e) => setCourseLanguage(e.target.value)}
                  className="w-full px-4 py-2 border border-ocean-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-400"
                >
                  {languages.map((lng) => (
                    <option key={lng} value={lng}>{lng}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="isPaid"
                  type="checkbox"
                  checked={courseIsPaid}
                  onChange={(e) => setCourseIsPaid(e.target.checked)}
                  className="h-4 w-4"
                />
                <label htmlFor="isPaid" className="text-sm text-ocean-700">Paid course</label>
              </div>

              <div className="md:col-span-2">
                <hr className="my-6 border-ocean-100" />
                <h3 className="text-lg font-semibold text-ocean-700 mb-2">Topics, Videos, and Resources</h3>
                <p className="text-sm text-ocean-600 mb-4">
                  Optionally add topics now. Each topic can include multiple videos and resource URLs. Order index fields are optional.
                </p>

                {/* Topics builder */}
                <div className="space-y-6">
                  {topicsDraft.map((t, tIdx) => (
                    <div key={tIdx} className="rounded-xl border border-ocean-100 bg-white/70 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold text-ocean-700">Topic #{tIdx + 1}</div>
                        <button
                          type="button"
                          onClick={() => removeTopic(tIdx)}
                          className="text-sm text-red-600 hover:underline"
                          disabled={topicsDraft.length === 1}
                          title={topicsDraft.length === 1 ? "Keep at least one topic block (or clear it)" : "Remove topic"}
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-ocean-700 mb-1">Title</label>
                          <input
                            type="text"
                            value={t.title}
                            onChange={(e) => updateTopic(tIdx, { title: e.target.value })}
                            className="w-full px-4 py-2 border border-ocean-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-400"
                            placeholder="e.g., Introduction"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-ocean-700 mb-1">Order Index (optional)</label>
                          <input
                            type="number"
                            value={t.order_index ?? ""}
                            onChange={(e) =>
                              updateTopic(tIdx, {
                                order_index: e.target.value === "" ? null : Number(e.target.value),
                              })
                            }
                            className="w-full px-4 py-2 border border-ocean-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-400"
                            placeholder="e.g., 1"
                          />
                        </div>
                      </div>

                      {/* Videos list */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-ocean-700">Videos</div>
                          <button
                            type="button"
                            onClick={() => addVideo(tIdx)}
                            className="text-sm text-ocean-700 hover:underline"
                          >
                            + Add Video
                          </button>
                        </div>

                        {t.videos.length === 0 ? (
                          <div className="text-sm text-ocean-500">No videos added.</div>
                        ) : (
                          <div className="space-y-4">
                            {t.videos.map((v, vIdx) => (
                              <div key={vIdx} className="rounded-lg border border-ocean-100 p-3 bg-white/60">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="text-sm font-medium text-ocean-700">Video #{vIdx + 1}</div>
                                  <button
                                    type="button"
                                    onClick={() => removeVideo(tIdx, vIdx)}
                                    className="text-xs text-red-600 hover:underline"
                                  >
                                    Remove
                                  </button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-ocean-700 mb-1">Title</label>
                                    <input
                                      type="text"
                                      value={v.title}
                                      onChange={(e) => updateVideo(tIdx, vIdx, { title: e.target.value })}
                                      className="w-full px-3 py-2 border border-ocean-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-400"
                                      placeholder="Video title"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-ocean-700 mb-1">Instructor</label>
                                    <input
                                      type="text"
                                      value={v.instructor}
                                      onChange={(e) => updateVideo(tIdx, vIdx, { instructor: e.target.value })}
                                      className="w-full px-3 py-2 border border-ocean-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-400"
                                      placeholder="Instructor"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-ocean-700 mb-1">Video URL</label>
                                    <input
                                      type="url"
                                      value={v.video_url}
                                      onChange={(e) => updateVideo(tIdx, vIdx, { video_url: e.target.value })}
                                      className="w-full px-3 py-2 border border-ocean-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-400"
                                      placeholder="https://..."
                                      required={false}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-ocean-700 mb-1">Thumbnail URL (optional)</label>
                                    <input
                                      type="url"
                                      value={v.thumbnail_url ?? ""}
                                      onChange={(e) => updateVideo(tIdx, vIdx, { thumbnail_url: e.target.value })}
                                      className="w-full px-3 py-2 border border-ocean-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-400"
                                      placeholder="https://..."
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-ocean-700 mb-1">Duration (seconds, optional)</label>
                                    <input
                                      type="number"
                                      value={v.duration ?? ""}
                                      onChange={(e) =>
                                        updateVideo(tIdx, vIdx, {
                                          duration: e.target.value === "" ? null : Number(e.target.value),
                                        })
                                      }
                                      className="w-full px-3 py-2 border border-ocean-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-400"
                                      placeholder="e.g., 600"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-ocean-700 mb-1">Order Index (optional)</label>
                                    <input
                                      type="number"
                                      value={v.order_index ?? ""}
                                      onChange={(e) =>
                                        updateVideo(tIdx, vIdx, {
                                          order_index: e.target.value === "" ? null : Number(e.target.value),
                                        })
                                      }
                                      className="w-full px-3 py-2 border border-ocean-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-400"
                                      placeholder="e.g., 1"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <input
                                      id={`is_free_${tIdx}_${vIdx}`}
                                      type="checkbox"
                                      checked={v.is_free ?? true}
                                      onChange={(e) => updateVideo(tIdx, vIdx, { is_free: e.target.checked })}
                                      className="h-4 w-4"
                                    />
                                    <label htmlFor={`is_free_${tIdx}_${vIdx}`} className="text-xs text-ocean-700">
                                      Free video
                                    </label>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Resources list */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-ocean-700">Resources</div>
                          <button
                            type="button"
                            onClick={() => addResource(tIdx)}
                            className="text-sm text-ocean-700 hover:underline"
                          >
                            + Add Resource
                          </button>
                        </div>

                        {t.resources.length === 0 ? (
                          <div className="text-sm text-ocean-500">No resources added.</div>
                        ) : (
                          <div className="space-y-3">
                            {t.resources.map((r, rIdx) => (
                              <div key={rIdx} className="rounded-lg border border-ocean-100 p-3 bg-white/60">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="text-sm font-medium text-ocean-700">Resource #{rIdx + 1}</div>
                                  <button
                                    type="button"
                                    onClick={() => removeResource(tIdx, rIdx)}
                                    className="text-xs text-red-600 hover:underline"
                                  >
                                    Remove
                                  </button>
                                </div>
                                <div className="grid md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-ocean-700 mb-1">Name</label>
                                    <input
                                      type="text"
                                      value={r.name}
                                      onChange={(e) => updateResource(tIdx, rIdx, { name: e.target.value })}
                                      className="w-full px-3 py-2 border border-ocean-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-400"
                                      placeholder="Resource name"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-ocean-700 mb-1">File URL</label>
                                    <input
                                      type="url"
                                      value={r.file_url}
                                      onChange={(e) => updateResource(tIdx, rIdx, { file_url: e.target.value })}
                                      className="w-full px-3 py-2 border border-ocean-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-400"
                                      placeholder="https://..."
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <button type="button" onClick={addTopic} className="text-ocean-700 hover:underline">
                    + Add Topic
                  </button>
                </div>

                <div className="mt-6">
                  <LiquidButton type="submit" variant="primary" disabled={creating}>
                    {creating ? "Saving..." : "Save All"}
                  </LiquidButton>
                </div>
              </div>
            </form>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default Admin;
