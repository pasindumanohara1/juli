import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "@/components/GlassCard";
import LiquidButton from "@/components/LiquidButton";
import { supabase } from "@/lib/supabaseClient";
import { PlusCircle } from "lucide-react";

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
  file_url: string; // URL only
};

type NewTopic = {
  title: string;
  order_index?: number | null;
  videos: NewVideo[];
  resources: NewResource[];
};

const AddCourse: React.FC = () => {
  const navigate = useNavigate();

  // Auth gate: redirect to /auth if not logged in
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/auth");
      }
    })();
  }, [navigate]);

  // Course state
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

  const categories = ["Math", "Science", "Commerce", "ICT", "Arts", "Other"];
  const levels = ["Beginner", "Ordinary", "Advanced", "Higher Education"];
  const languages = ["English", "Sri Lanka", "India"];

  // Topics builder (same behavior as Admin, including auto-fill for videos)
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

      if (preparedTopics.length > 0) {
        const { error: terr } = await supabase.from("topics").insert(preparedTopics);
        if (terr) throw new Error(terr.message);
      }

      // Fetch topics to map titles -> ids
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

      // 3) Insert videos/resources per topic (title-matched)
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
            file_url: (r.file_url ?? "").trim(),
          }));
        if (res.length > 0) {
          const { error: rerr } = await supabase.from("resources").insert(res);
          if (rerr) throw new Error(`Resources insert failed for topic "${tTitle}": ${rerr.message}`);
        }
      }

      alert("Course, topics, videos, and resources created.");
      // Reset
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
      navigate("/dashboard");
    } catch (e: any) {
      alert(e?.message ?? "Failed to create course with details");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-ocean-700">Add Course</h1>
            <p className="text-ocean-500">Create a course and optionally add topics, videos, and resources.</p>
          </div>
        </div>

        <GlassCard className="p-6">
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
      </div>
    </div>
  );
};

export default AddCourse;
