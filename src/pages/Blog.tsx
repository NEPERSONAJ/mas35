import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ChevronRight, Search, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  image: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  tags: string[];
}

const blogPosts: BlogPost[] = [
  {
    id: 'benefits-of-massage',
    title: 'Польза массажа для здоровья и благополучия',
    excerpt: 'Узнайте, как регулярный массаж может улучшить ваше физическое и ментальное здоровье.',
    content: 'Полный текст статьи о пользе массажа...',
    date: '2024-03-15',
    readTime: '5 мин',
    image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=1000',
    author: {
      name: 'Магомед Магомедов',
      role: 'Главный массажист',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400',
    },
    tags: ['Здоровье', 'Массаж', 'Велнес']
  },
  {
    id: 'stress-relief-techniques',
    title: 'Техники снятия стресса через массаж',
    excerpt: 'Эффективные методики массажа для борьбы со стрессом и напряжением.',
    content: 'Полный текст статьи о техниках массажа...',
    date: '2024-03-14',
    readTime: '7 мин',
    image: 'https://images.unsplash.com/photo-1519824145371-296894a0daa9?auto=format&fit=crop&q=80&w=1000',
    author: {
      name: 'Патимат Алиева',
      role: 'Массажист-терапевт',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400',
    },
    tags: ['Стресс', 'Релаксация', 'Здоровье']
  },
  {
    id: 'sports-massage-guide',
    title: 'Руководство по спортивному массажу',
    excerpt: 'Все, что нужно знать о спортивном массаже: подготовка, техники, восстановление.',
    content: 'Полный текст статьи о спортивном массаже...',
    date: '2024-03-13',
    readTime: '6 мин',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=1000',
    author: {
      name: 'Амина Исаева',
      role: 'Спортивный массажист',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400',
    },
    tags: ['Спорт', 'Массаж', 'Восстановление']
  }
];

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Get unique tags
  const allTags = Array.from(new Set(blogPosts.flatMap(post => post.tags)));

  // Filter posts based on search and tags
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || post.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600 mb-6">
            Блог о массаже и здоровье
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Полезные статьи, советы экспертов и последние новости из мира массажа и велнеса
          </p>
        </motion.div>

        {/* Search and Filters */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск статей..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-amber-500 transition-colors"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    selectedTag === tag
                      ? 'bg-amber-500 text-white'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300'
                  }`}
                >
                  <Tag className="w-4 h-4" />
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-amber-500/50 transition-colors"
            >
              <Link to={`/blog/${post.id}`} className="block">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-sm font-medium text-amber-500">
                        {post.author.name}
                      </h3>
                      <p className="text-xs text-gray-400">{post.author.role}</p>
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold mb-3 group-hover:text-amber-500 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-400 text-sm mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(post.date), 'd MMMM yyyy', { locale: ru })}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {post.readTime}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs rounded-md bg-white/5 text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-6 h-6 text-amber-500" />
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;