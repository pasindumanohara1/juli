
import React, { useEffect, useMemo, useState } from 'react';
import { Send, Heart, MessageCircle, Share2, User, ThumbsUp, BookOpen, Users, AlertTriangle } from 'lucide-react';
import LiquidBackground from '@/components/LiquidBackground';
import GlassCard from '@/components/GlassCard';
import LiquidButton from '@/components/LiquidButton';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';

const Community = () => {
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  type PostRow = {
    id: string;
    author_id: string | null;
    content: string | null;
    image_url: string | null;
    category: string | null;
    likes: number | null;
    reports: number | null;
    created_at: string | null;
    author_name?: string | null; // joined from profiles
  };

  const [posts, setPosts] = useState<PostRow[]>([]);
  const [liked, setLiked] = useState<Record<string, boolean>>({}); // local like state
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [reported, setReported] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);

    // 1) Fetch posts (no join)
    const { data: postData, error: postErr } = await supabase
      .from('posts')
      .select('id,author_id,content,image_url,category,likes,reports,created_at')
      .order('created_at', { ascending: false });

    if (postErr) {
      setError(postErr.message);
      toast({
        title: 'Failed to load posts',
        description: postErr.message,
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    const postsRaw = (postData ?? []) as Array<{
      id: string; author_id: string | null; content: string | null; image_url: string | null;
      category: string | null; likes: number | null; reports: number | null; created_at: string | null;
    }>;

    // 2) Collect unique author ids
    const authorIds = Array.from(
      new Set(postsRaw.map(p => p.author_id).filter((v): v is string => !!v))
    );

    // 3) Fetch profiles for these authors and build map
    let nameById: Record<string, string> = {};
    if (authorIds.length > 0) {
      const { data: profilesData, error: profErr } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', authorIds);
      if (!profErr && profilesData) {
        profilesData.forEach((row: any) => {
          if (row?.id) nameById[row.id] = row.full_name ?? null;
        });
      }
      // If profErr, we silently fall back to null names (UI shows 'User')
    }

    // 4) Shape posts with author_name from the map
    const shaped: PostRow[] = postsRaw.map((p) => ({
      id: p.id,
      author_id: p.author_id,
      content: p.content,
      image_url: p.image_url,
      category: p.category,
      likes: p.likes,
      reports: p.reports,
      created_at: p.created_at,
      author_name: p.author_id ? nameById[p.author_id] ?? null : null,
    }));

    setPosts(shaped);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
    // Preload current user + interactions to set initial liked/saved/reported UI
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id ?? null;
      setCurrentUserId(uid);
      if (!uid) return;
      const { data: interactions } = await supabase
        .from('post_interactions')
        .select('post_id, action')
        .eq('user_id', uid);
      if (interactions && interactions.length) {
        const likedMap: Record<string, boolean> = {};
        const savedMap: Record<string, boolean> = {};
        const reportedMap: Record<string, boolean> = {};
        interactions.forEach((i: any) => {
          if (i.action === 'like') likedMap[i.post_id] = true;
          if (i.action === 'save') savedMap[i.post_id] = true;
          if (i.action === 'report') reportedMap[i.post_id] = true;
        });
        setLiked(likedMap);
        setSaved(savedMap);
        setReported(reportedMap);
      }
    })();
  }, []);

  // Step 2 will implement create post. For now, keep UI button disabled until text provided.
  const handleSubmitPost = async () => {
    if (!newPost.trim()) return;
    setSubmitting(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id;
      if (!uid) {
        setError('You must be signed in to post.');
        toast({
          title: 'Sign in required',
          description: 'Please sign in to publish a post.',
          variant: 'destructive',
        });
        window.location.href = '/auth';
        return;
      }
      const insertObj = {
        author_id: uid,
        content: newPost.trim(),
        image_url: null,
        category: null,
      };
      const { data, error } = await supabase
        .from('posts')
        .insert(insertObj)
        .select('id,author_id,content,image_url,category,likes,reports,created_at')
        .single();
      if (error) {
        console.error('[Community] Insert post error:', error);
        setError(error.message || 'Failed to create post');
        toast({
          title: 'Failed to publish post',
          description: error.message || 'Unknown error',
          variant: 'destructive',
        });
        return;
      }
      if (!data) {
        console.error('[Community] Insert returned no data');
        setError('Failed to create post (no data returned)');
        toast({
          title: 'Failed to publish post',
          description: 'No data returned from server.',
          variant: 'destructive',
        });
        return;
      }

      // Fetch author's name separately (client-side join)
      let authorName: string | null = null;
      if (data.author_id) {
        const { data: prof, error: profErr } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', data.author_id)
          .maybeSingle();
        if (!profErr) {
          authorName = prof?.full_name ?? null;
        }
      }

      const shaped: PostRow = {
        id: (data as any).id,
        author_id: (data as any).author_id,
        content: (data as any).content,
        image_url: (data as any).image_url,
        category: (data as any).category,
        likes: (data as any).likes,
        reports: (data as any).reports,
        created_at: (data as any).created_at,
        author_name: authorName,
      };
      setPosts((prev) => [shaped, ...prev]);
      setNewPost('');
      toast({
        title: 'Post published',
        description: 'Your post is now live.',
      });
    } catch (e: any) {
      console.error('[Community] Insert post exception:', e);
      setError(e?.message || 'Failed to create post');
      toast({
        title: 'Failed to publish post',
        description: e?.message || 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id;
      if (!uid) {
        toast({
          title: 'Sign in required',
          description: 'Please sign in to like posts.',
          variant: 'destructive',
        });
        window.location.href = '/auth';
        return;
      }
      const isLiked = !!liked[postId];

      if (!isLiked) {
        // Like: insert interaction, increment likes
        const { error: insErr } = await supabase
          .from('post_interactions')
          .insert({ user_id: uid, post_id: postId, action: 'like' });
        if (insErr && insErr.code !== '23505') throw insErr; // ignore unique violation as already liked

        await supabase
          .from('posts')
          .update({ likes: (posts.find(p => p.id === postId)?.likes ?? 0) + 1 })
          .eq('id', postId);
        setLiked((prev) => ({ ...prev, [postId]: true }));
        setPosts((prev) => prev.map(p => p.id === postId ? { ...p, likes: (p.likes ?? 0) + 1 } : p));
      } else {
        // Unlike: delete interaction, decrement likes
        const { error: delErr } = await supabase
          .from('post_interactions')
          .delete()
          .eq('user_id', uid)
          .eq('post_id', postId)
          .eq('action', 'like');
        if (delErr) throw delErr;

        const current = posts.find(p => p.id === postId)?.likes ?? 0;
        const next = current > 0 ? current - 1 : 0;
        await supabase.from('posts').update({ likes: next }).eq('id', postId);
        setLiked((prev) => ({ ...prev, [postId]: false }));
        setPosts((prev) => prev.map(p => p.id === postId ? { ...p, likes: next } : p));
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to toggle like');
      toast({
        title: 'Failed to like',
        description: e?.message || 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async (postId: string) => {
    try {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id;
      if (!uid) {
        toast({
          title: 'Sign in required',
          description: 'Please sign in to save posts.',
          variant: 'destructive',
        });
        window.location.href = '/auth';
        return;
      }
      const isSaved = !!saved[postId];

      if (!isSaved) {
        const { error: insErr } = await supabase
          .from('post_interactions')
          .insert({ user_id: uid, post_id: postId, action: 'save' });
        if (insErr && insErr.code !== '23505') throw insErr;
        setSaved((prev) => ({ ...prev, [postId]: true }));
      } else {
        const { error: delErr } = await supabase
          .from('post_interactions')
          .delete()
          .eq('user_id', uid)
          .eq('post_id', postId)
          .eq('action', 'save');
        if (delErr) throw delErr;
        setSaved((prev) => ({ ...prev, [postId]: false }));
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to toggle save');
      toast({
        title: 'Failed to save',
        description: e?.message || 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleReport = async (postId: string) => {
    try {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id;
      if (!uid) {
        toast({
          title: 'Sign in required',
          description: 'Please sign in to report posts.',
          variant: 'destructive',
        });
        window.location.href = '/auth';
        return;
      }
      if (reported[postId]) return; // already reported

      const { error: insErr } = await supabase
        .from('post_interactions')
        .insert({ user_id: uid, post_id: postId, action: 'report' });
      if (insErr && insErr.code !== '23505') throw insErr;

      // Increment reports
      const currentReports = posts.find(p => p.id === postId)?.reports ?? 0;
      const nextReports = currentReports + 1;

      // If reports reach threshold (20), delete post
      if (nextReports >= 20) {
        const { error: delErr } = await supabase
          .from('posts')
          .delete()
          .eq('id', postId);
        if (delErr) throw delErr;
        // Optimistically remove from UI
        setPosts((prev) => prev.filter(p => p.id !== postId));
        toast({
          title: 'Post removed',
          description: 'This post was removed due to reports.',
        });
        return;
      }

      await supabase
        .from('posts')
        .update({ reports: nextReports })
        .eq('id', postId);

      setReported((prev) => ({ ...prev, [postId]: true }));
      setPosts((prev) => prev.map(p => p.id === postId ? { ...p, reports: nextReports } : p));
    } catch (e: any) {
      setError(e?.message || 'Failed to report post');
      toast({
        title: 'Failed to report',
        description: e?.message || 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const communityStats = [
    { icon: Users, label: 'Active Members', value: '12,450' },
    { icon: MessageCircle, label: 'Discussions Today', value: '89' },
    { icon: BookOpen, label: 'Study Groups', value: '24' },
    { icon: ThumbsUp, label: 'Helpful Answers', value: '1,234' }
  ];

  return (
    <div className="min-h-screen pt-24">
      <LiquidBackground />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-ocean-600 mb-4">
            Learning Community
          </h1>
          <p className="text-xl text-ocean-500 max-w-2xl mx-auto">
            Connect with fellow learners, share insights, and grow together
          </p>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {communityStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <GlassCard key={index} className="p-4 text-center">
                <div className="w-10 h-10 bg-gradient-to-br from-ocean-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-lg font-bold text-ocean-600">{stat.value}</div>
                <div className="text-sm text-ocean-500">{stat.label}</div>
              </GlassCard>
            );
          })}
        </div>

        {/* Create Post */}
        {error && (
          <div className="mb-4 text-sm text-red-600 text-center">{error}</div>
        )}
        <GlassCard className="p-6 mb-8">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share your thoughts, ask questions, or help others..."
                className="w-full h-24 p-4 bg-white/50 border border-ocean-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-transparent transition-all duration-300"
              />
              <div className="flex justify-end mt-4">
                <LiquidButton
                  onClick={handleSubmitPost}
                  disabled={!newPost.trim() || submitting}
                  variant="primary"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Share Post
                </LiquidButton>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Posts Feed */}
        <div className="space-y-6">
          {loading && (
            <div className="space-y-6 py-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-6 rounded-xl border border-ocean-100 bg-white/70 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-ocean-100" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-5 w-28 rounded bg-ocean-100" />
                        <div className="h-4 w-14 rounded bg-ocean-100" />
                        <div className="h-5 w-16 rounded bg-ocean-100" />
                      </div>
                      <div className="h-40 w-full rounded-xl bg-ocean-100/70 mb-3" />
                      <div className="space-y-2 mb-4">
                        <div className="h-4 w-5/6 rounded bg-ocean-100" />
                        <div className="h-4 w-2/3 rounded bg-ocean-100" />
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="h-8 w-16 rounded-full bg-ocean-100" />
                        <div className="h-8 w-20 rounded-full bg-ocean-100" />
                        <div className="h-8 w-24 rounded-full bg-ocean-100" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {error && !loading && (
            <div className="flex items-center justify-center py-12 text-red-600 gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Failed to load posts: {error}</span>
            </div>
          )}
          {!loading && !error && posts.length === 0 && (
            <div className="text-center text-ocean-500 py-12">No posts yet.</div>
          )}
          {!loading && !error && posts.map((post) => (
            <GlassCard key={post.id} className="p-6 liquid-hover">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-ocean-600">
                      {post.author_name ?? 'User'}
                    </h3>
                    <span className="text-sm text-ocean-500">•</span>
                    <span className="text-sm text-ocean-500">
                      {post.created_at ? new Date(post.created_at).toLocaleString() : 'Just now'}
                    </span>
                    {post.category && (
                      <>
                        <span className="text-sm text-ocean-500">•</span>
                        <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full">
                          {post.category}
                        </span>
                      </>
                    )}
                    {/* Owner delete button */}
                    {currentUserId && post.author_id === currentUserId && (
                      <>
                        <span className="text-sm text-ocean-500">•</span>
                        <button
                          onClick={async () => {
                            try {
                              const confirmDelete = window.confirm('Delete this post?');
                              if (!confirmDelete) return;
                              const { error: delErr } = await supabase
                                .from('posts')
                                .delete()
                                .eq('id', post.id)
                                .eq('author_id', currentUserId);
                              if (delErr) throw delErr;
                              setPosts((prev) => prev.filter(p => p.id !== post.id));
                              toast({
                                title: 'Post deleted',
                                description: 'Your post has been removed.',
                              });
                            } catch (e: any) {
                              setError(e?.message || 'Failed to delete post');
                              toast({
                                title: 'Failed to delete post',
                                description: e?.message || 'Unknown error',
                                variant: 'destructive',
                              });
                            }
                          }}
                          className="text-red-600 hover:underline text-sm"
                          title="Delete your post"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>

                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt="post"
                      className="w-full max-h-80 object-cover rounded-xl border border-ocean-100 mb-3"
                    />
                  )}
                  
                  <p className="text-ocean-600 mb-4 leading-relaxed">
                    {post.content}
                  </p>
                  
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 ${
                        liked[post.id]
                          ? 'text-red-500 bg-red-50'
                          : 'text-ocean-500 hover:text-red-500 hover:bg-red-50'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${liked[post.id] ? 'fill-current' : ''}`} />
                      <span className="text-sm font-medium">{post.likes ?? 0}</span>
                    </button>

                    <button
                      onClick={() => handleSave(post.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 ${
                        saved[post.id]
                          ? 'text-teal-700 bg-teal-100'
                          : 'text-ocean-500 hover:text-teal-700 hover:bg-teal-50'
                      }`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">{saved[post.id] ? 'Saved' : 'Save'}</span>
                    </button>

                    <button
                      onClick={() => handleReport(post.id)}
                      disabled={!!reported[post.id]}
                      className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 ${
                        reported[post.id]
                          ? 'text-orange-700 bg-orange-100 cursor-not-allowed'
                          : 'text-ocean-500 hover:text-orange-700 hover:bg-orange-50'
                      }`}
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm font-medium">{reported[post.id] ? 'Reported' : 'Report'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <LiquidButton variant="secondary">
            Load More Posts
          </LiquidButton>
        </div>
      </div>
    </div>
  );
};

export default Community;
