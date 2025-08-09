
import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, TrendingUp, Clock, Award, Users, MessageCircle, Star, ChevronRight, PlusCircle } from 'lucide-react';
import LiquidBackground from '@/components/LiquidBackground';
import GlassCard from '@/components/GlassCard';
import LiquidButton from '@/components/LiquidButton';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState<string>('User');
  const [country, setCountry] = useState<string | null>(null);
  const [birthday, setBirthday] = useState<string | null>(null);

  // Edit Profile state
  const [editing, setEditing] = useState(false);
  const [formFullName, setFormFullName] = useState("");
  const [formCountry, setFormCountry] = useState("Sri Lanka");
  const [formBirthday, setFormBirthday] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  

  // Defaults for first-time users as requested
  const userStats = [
    { icon: BookOpen, label: 'Courses Enrolled', value: '0', color: 'from-blue-500 to-blue-600' },
    { icon: Award, label: 'Courses Completed', value: '0', color: 'from-green-500 to-green-600' },
    { icon: Clock, label: 'Hours Learned', value: '0', color: 'from-purple-500 to-purple-600' },
    { icon: TrendingUp, label: 'Current Streak', value: '0 days', color: 'from-orange-500 to-orange-600' }
  ];

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      // get current session
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!userId) {
        navigate('/auth', { replace: true });
        return;
      }
      // fetch profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name,country,birthday')
        .eq('id', userId)
        .maybeSingle();

      if (!mounted) return;

      if (!error && profile) {
        // Existing profile
        setFullName(profile.full_name || 'User');
        setCountry(profile.country || null);
        setBirthday(profile.birthday || null);
      } else {
        // Auto-create/patch profile from auth metadata (A)
        const { data: userRes } = await supabase.auth.getUser();
        const meta = userRes.user?.user_metadata || {};
        const patched = {
          id: userId,
          full_name: meta.full_name || 'User',
          country: meta.country || null,
          birthday: meta.birthday || null,
        };
        await supabase.from('profiles').upsert(patched);
        setFullName(patched.full_name || 'User');
        setCountry(patched.country || null);
        setBirthday(patched.birthday || null);
      }

      // Initialize edit form values
      setFormFullName((profile?.full_name ?? fullName) || 'User');
      setFormCountry((profile?.country ?? country) || 'Sri Lanka');
      setFormBirthday((profile?.birthday ?? birthday) || '');
      setLoading(false);
    };
    load();
    return () => { mounted = false; };
  }, [navigate]);

  // Placeholder lists retained; real data wiring can replace these later
  const enrolledCourses: Array<{
    id: number; title: string; progress: number; nextLesson: string; dueDate: string; thumbnail: string;
  }> = [];

  const recentActivity: Array<{ type: string; title: string; course: string; time: string; icon: any; }> = [];

  const achievements: Array<{ name: string; description: string; earned: boolean; }> = [];

  return (
    <div className="min-h-screen pt-24">
      <LiquidBackground />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center mx-auto sm:mx-0">
              <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-ocean-600">
                {loading ? 'Loading...' : `Welcome back, ${fullName}!`}
              </h1>
              <p className="text-ocean-500 text-sm sm:text-base">
                {country ? `Country: ${country}` : 'Country: -'} {birthday ? `• Birthday: ${birthday}` : '• Birthday: -'}
              </p>
            </div>
            <div className="flex flex-wrap justify-center sm:justify-end items-center gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setEditing((e) => !e);
                  setError(null);
                  setFormFullName(fullName || "User");
                  setFormCountry(country || "Sri Lanka");
                  setFormBirthday(birthday || "");
                }}
                className="px-4 py-2 rounded-full border border-ocean-200 text-ocean-700 hover:bg-ocean-50 transition"
              >
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
              <button
                onClick={() => navigate('/dashboard/add-course')}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-teal-600 text-white hover:bg-teal-700 transition text-sm sm:text-base"
                title="Add Course"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="font-medium">Add Course</span>
              </button>
              
            </div>
          </div>

          {/* Edit Profile Form (B) */}
          {editing && (
            <div className="rounded-xl border border-ocean-100 p-4 bg-white/40">
              {error && <div className="mb-2 text-sm text-red-600">{error}</div>}
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-ocean-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-ocean-200 focus:outline-none focus:ring-2 focus:ring-ocean-400"
                  />
                </div>
                <div>
                  <label className="block text-sm text-ocean-600 mb-1">Country</label>
                  <select
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-ocean-200 focus:outline-none focus:ring-2 focus:ring-ocean-400"
                  >
                    <option value="Sri Lanka">Sri Lanka</option>
                    <option value="India">India</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-ocean-600 mb-1">Birthday</label>
                  <input
                    type="date"
                    value={formBirthday || ''}
                    onChange={(e) => setFormBirthday(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-ocean-200 focus:outline-none focus:ring-2 focus:ring-ocean-400"
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  disabled={saving}
                  onClick={async () => {
                    setError(null);
                    if (!formFullName.trim()) {
                      setError('Full name is required');
                      return;
                    }
                    setSaving(true);
                    const { data: sess } = await supabase.auth.getSession();
                    const uid = sess.session?.user?.id;
                    if (!uid) {
                      setSaving(false);
                      setError('Not authenticated');
                      return;
                    }
                    const { error: upErr } = await supabase
                      .from('profiles')
                      .upsert({
                        id: uid,
                        full_name: formFullName.trim(),
                        country: formCountry || null,
                        birthday: formBirthday || null,
                      });
                    setSaving(false);
                    if (upErr) {
                      setError(upErr.message);
                      return;
                    }
                    setFullName(formFullName.trim());
                    setCountry(formCountry || null);
                    setBirthday(formBirthday || null);
                    setEditing(false);
                  }}
                  className="px-5 py-2 rounded-full bg-ocean-600 text-white hover:bg-ocean-700 transition disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  disabled={saving}
                  onClick={() => setEditing(false)}
                  className="px-5 py-2 rounded-full border border-ocean-200 text-ocean-700 hover:bg-ocean-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {userStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <GlassCard key={index} className="p-4 sm:p-6 text-center">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${stat.color} rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-ocean-600 mb-1">{stat.value}</div>
                <div className="text-xs sm:text-sm text-ocean-500">{stat.label}</div>
              </GlassCard>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Current Courses */}
          <div className="space-y-6">
            <GlassCard className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-ocean-600">Continue Learning</h2>
                <Link to="/courses">
                  <LiquidButton size="sm" variant="secondary">
                    View All
                  </LiquidButton>
                </Link>
              </div>

              <div className="space-y-4">
                {enrolledCourses.length === 0 && (
                  <div className="text-ocean-500 text-sm">No enrolled courses yet.</div>
                )}
                {enrolledCourses.map((course) => (
                  <div key={course.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/30 rounded-xl hover:bg-white/40 transition-colors cursor-pointer">
                    <img 
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-ocean-600 mb-1 text-sm sm:text-base">{course.title}</h3>
                      <p className="text-xs sm:text-sm text-ocean-500 mb-2">Next: {course.nextLesson}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 mr-4">
                          <div className="w-full bg-ocean-100 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-teal-500 to-ocean-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-ocean-600">{course.progress}%</span>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full mb-1">
                        {course.dueDate}
                      </div>
                      <ChevronRight className="w-5 h-5 text-ocean-400" />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Achievements */}
            <GlassCard className="p-6">
              <h2 className="text-2xl font-semibold text-ocean-600 mb-6">Achievements</h2>
              <div className="grid grid-cols-2 gap-3">
                {achievements.length === 0 && (
                  <div className="text-ocean-500 text-sm col-span-2">No achievements yet.</div>
                )}
                {achievements.map((achievement, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-xl border transition-all duration-300 ${
                      achievement.earned 
                        ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-sm'
                        : 'bg-white/20 border-ocean-100 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        achievement.earned ? 'bg-yellow-400' : 'bg-ocean-200'
                      }`}>
                        <Star className={`w-3 h-3 ${achievement.earned ? 'text-white' : 'text-ocean-400'}`} />
                      </div>
                      <h4 className="font-medium text-ocean-600 text-sm">{achievement.name}</h4>
                    </div>
                    <p className="text-xs text-ocean-500">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Recent Activity */}
          <div>
            <GlassCard className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-ocean-600 mb-4 sm:mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.length === 0 && (
                  <div className="text-ocean-500 text-sm">No recent activity yet.</div>
                )}
                {recentActivity.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={index} className="flex items-start gap-3 sm:gap-4 p-3 rounded-xl hover:bg-white/20 transition-colors">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-ocean-100 to-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-ocean-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-ocean-600 mb-1 text-sm sm:text-base">{activity.title}</p>
                        <p className="text-xs sm:text-sm text-ocean-500 mb-1">{activity.course}</p>
                        <p className="text-xs text-ocean-400">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 pt-4 border-t border-ocean-100">
                <LiquidButton variant="secondary" className="w-full">
                  View All Activity
                </LiquidButton>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Sign out button at bottom */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-24 sm:pb-10">
        <div className="flex justify-end">
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/auth";
            }}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition shadow-sm"
            title="Sign Out"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
