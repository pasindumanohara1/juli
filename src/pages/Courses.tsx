
import React, { useEffect, useMemo, useState } from 'react';
import { Search, Users, Star, Play, AlertTriangle, Filter, X } from 'lucide-react';
import LiquidBackground from '@/components/LiquidBackground';
import GlassCard from '@/components/GlassCard';
import LiquidButton from '@/components/LiquidButton';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

const Courses = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Raw search input & debounced value
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Dropdown filters
  // Defaults requested: Level=All, Stream=All, Price=Free, Sort=Popularity
  const [level, setLevel] = useState<string>('all');            // beginner | ordinary | advanced
  const [stream, setStream] = useState<string>('all');          // tech | commerce | science | maths | arts | etc
  const [price, setPrice] = useState<string>('free');           // all | free | paid
  const [sort, setSort] = useState<string>('popularity');       // popularity | most_rated
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  type CourseRow = {
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

  const [courses, setCourses] = useState<CourseRow[]>([]);

  // Initialize state from URL query params once
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qLevel = (params.get('level') || 'all').toLowerCase();
    const qStream = (params.get('stream') || 'all').toLowerCase();
    const qPrice = (params.get('price') || 'free').toLowerCase();
    const qSort = (params.get('sort') || 'popularity').toLowerCase();
    const qSearch = params.get('q') || '';

    setLevel(['all','beginner','ordinary','advanced'].includes(qLevel) ? qLevel : 'all');
    setStream(['all','tech','commerce','science','maths','arts','etc'].includes(qStream) ? qStream : 'all');
    setPrice(['all','free','paid'].includes(qPrice) ? qPrice : 'free');
    setSort(['popularity','most_rated'].includes(qSort) ? qSort : 'popularity');
    setSearchQuery(qSearch);
    setDebouncedSearch(qSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase
          .from('courses')
          .select('id,name,description,instructor_name,level,category,thumbnail_url,rate,students_enrolled,is_paid,recommended,created_at')
          .order('recommended', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(error.message);
        }
        setCourses((data ?? []) as CourseRow[]);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Reflect filters in URL when they change (client-side only)
  useEffect(() => {
    const params = new URLSearchParams();
    if (level !== 'all') params.set('level', level);
    if (stream !== 'all') params.set('stream', stream);
    if (price !== 'free') params.set('price', price);
    if (sort !== 'popularity') params.set('sort', sort);
    if (debouncedSearch) params.set('q', debouncedSearch);

    const qs = params.toString();
    const next = qs ? `?${qs}` : '';
    // Replace current entry to avoid stacking history
    navigate({ search: next }, { replace: true });
  }, [level, stream, price, sort, debouncedSearch, navigate]);

  // Debounce search input (200ms)
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchQuery), 200);
    return () => clearTimeout(id);
  }, [searchQuery]);

  // Removed tab filters; using dropdowns instead

  // Removed dummy courses; we use DB values only

  const filteredCourses = useMemo(() => {
    const q = debouncedSearch.toLowerCase();

    let list = courses.filter((course) => {
      // Search
      const matchesSearch =
        (course.name ?? '').toLowerCase().includes(q) ||
        (course.instructor_name ?? '').toLowerCase().includes(q) ||
        (course.description ?? '').toLowerCase().includes(q);

      // Level filter
      const lvl = (course.level ?? '').toLowerCase();
      const matchesLevel =
        level === 'all' ||
        (level === 'beginner' && ['beginner', 'biginner'].includes(lvl)) ||
        (level === 'ordinary' && ['ordinary', 'ordinery'].includes(lvl)) ||
        (level === 'advanced' && lvl === 'advanced');

      // Stream filter (map category to simplified streams)
      const cat = (course.category ?? '').toLowerCase();
      const matchesStream =
        stream === 'all' ||
        (stream === 'tech' && ['tech', 'ict', 'it', 'technology', 'computer', 'cs'].some((k) => cat.includes(k))) ||
        (stream === 'commerce' && ['commerce', 'business', 'account', 'econ', 'economics'].some((k) => cat.includes(k))) ||
        (stream === 'science' && ['science', 'biology', 'physics', 'chemistry'].some((k) => cat.includes(k))) ||
        (stream === 'maths' && ['math', 'maths', 'mathematics'].some((k) => cat.includes(k))) ||
        (stream === 'arts' && ['arts', 'art', 'history', 'languages'].some((k) => cat.includes(k))) ||
        (stream === 'etc' && !['tech','ict','it','technology','computer','cs','commerce','business','account','econ','economics','science','biology','physics','chemistry','math','maths','mathematics','arts','art','history','languages'].some((k)=>cat.includes(k)));

      // Price filter
      const matchesPrice =
        price === 'all' ||
        (price === 'free' && !course.is_paid) ||
        (price === 'paid' && !!course.is_paid);

      return matchesSearch && matchesLevel && matchesStream && matchesPrice;
    });

    // Sorting
    let sorted = list;
    if (sort === 'popularity') {
      sorted = [...list].sort((a, b) => (b.students_enrolled ?? 0) - (a.students_enrolled ?? 0));
    } else if (sort === 'most_rated') {
      sorted = [...list].sort((a, b) => (b.rate ?? 0) - (a.rate ?? 0));
    }

    return sorted;
  }, [courses, debouncedSearch, level, stream, price, sort]);

  return (
    <div className="min-h-screen pt-24">
      <LiquidBackground />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-ocean-600 mb-4">
            Explore Our Courses
          </h1>
          <p className="text-xl text-ocean-500 max-w-2xl mx-auto">
            Discover structured learning paths designed by experts to help you achieve your goals
          </p>
        </div>

        {/* Search and Filter Bar */}
        <GlassCard className="p-6 mb-8">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-ocean-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses or instructors..."
                aria-label="Search courses or instructors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-3 bg-white/50 border border-ocean-200 rounded-full focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-transparent transition-all duration-300"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-ocean-400 hover:text-ocean-600 hover:bg-ocean-50"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Dropdown Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm text-ocean-600 min-w-16">Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-white/70 border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400"
                >
                  <option value="all">All</option>
                  <option value="beginner">Biginner</option>
                  <option value="ordinary">Ordinery</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-ocean-600 min-w-16">Stream</label>
                <select
                  value={stream}
                  onChange={(e) => setStream(e.target.value)}
                  className="w-full px-3 py-2 bg-white/70 border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400"
                >
                  <option value="all">All</option>
                  <option value="tech">Tech</option>
                  <option value="commerce">Commase</option>
                  <option value="science">Science</option>
                  <option value="maths">Maths</option>
                  <option value="arts">Art</option>
                  <option value="etc">Etc</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-ocean-600 min-w-16">Price</label>
                <select
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-white/70 border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400"
                >
                  <option value="all">All</option>
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-ocean-600 min-w-16">Sort</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full px-3 py-2 bg-white/70 border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-400"
                >
                  <option value="popularity">Popularity</option>
                  <option value="most_rated">Most Rated</option>
                </select>
              </div>

              <div className="flex items-center justify-end">
                <button
                  onClick={() => {
                    setLevel('all');
                    setStream('all');
                    setPrice('free');
                    setSort('popularity');
                    setSearchQuery('');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-ocean-200 text-ocean-700 hover:bg-ocean-50 transition"
                  title="Reset filters"
                >
                  <Filter className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Loading / Error States */}
        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-ocean-100 bg-white/70 animate-pulse">
                <div className="h-48 w-full bg-ocean-100/50" />
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-6 w-24 rounded-full bg-ocean-100" />
                    <div className="h-4 w-10 rounded bg-ocean-100" />
                  </div>
                  <div className="h-5 w-3/4 rounded bg-ocean-100" />
                  <div className="h-4 w-1/2 rounded bg-ocean-100" />
                  <div className="flex items-center justify-between pt-2">
                    <div className="h-4 w-24 rounded bg-ocean-100" />
                    <div className="h-9 w-24 rounded-full bg-ocean-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span>Failed to load courses: {error}</span>
            </div>
          </div>
        )}

        {/* Course Grid */}
        {!loading && !error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <GlassCard key={course.id} className="overflow-hidden group">
                {/* Course Thumbnail */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={course.thumbnail_url ?? "https://placehold.co/600x400?text=Course"} 
                    alt={course.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ocean-900/50 to-transparent"></div>
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                      {course.category ?? 'Uncategorized'}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-ocean-600">
                        {course.rate?.toFixed(1) ?? '0.0'}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-ocean-600 mb-2 group-hover:text-ocean-700 transition-colors">
                    {course.name}
                  </h3>
                  
                  <p className="text-ocean-500 mb-2">
                    {course.instructor_name ? `by ${course.instructor_name}` : ''}
                  </p>

                  <p className="text-ocean-500 mb-4 line-clamp-3">
                    {course.description ?? ''}
                  </p>

                  <div className="flex items-center justify-between text-sm text-ocean-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{(course.students_enrolled ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="text-xs px-2 py-1 rounded-full bg-ocean-50 text-ocean-600 border border-ocean-100">
                      {course.level ?? 'Level'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-ocean-600">
                      {course.is_paid ? 'Paid Course' : 'Free Course'}
                    </span>
                    <Link to={`/course/${course.id}`}>
                      <LiquidButton size="sm" variant="primary">
                        View
                      </LiquidButton>
                    </Link>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredCourses.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-ocean-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-ocean-400" />
            </div>
            <h3 className="text-2xl font-semibold text-ocean-600 mb-4">No courses found</h3>
            <p className="text-ocean-500 mb-6">Try adjusting your search criteria or browse all courses</p>
            <LiquidButton onClick={() => { setSearchQuery(''); setLevel('all'); setStream('all'); setPrice('free'); setSort('popularity'); }}>
              Show All Courses
            </LiquidButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
