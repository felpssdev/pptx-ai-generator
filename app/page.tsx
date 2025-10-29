'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  Zap,
  Palette,
  Clock,
  Download,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { TEMPLATES } from '@/lib/templates';
import Link from 'next/link';

export default function LandingPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGeneratePresentation = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    // Simulate navigation to create page with prompt
    router.push(`/create?prompt=${encodeURIComponent(prompt)}`);
  };

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Generation',
      description:
        'Describe your presentation and let AI generate professional slides with content.',
    },
    {
      icon: Palette,
      title: 'Brand Customization',
      description:
        'Upload your logo and let our AI extract colors to match your brand perfectly.',
    },
    {
      icon: Clock,
      title: 'Speaker Notes',
      description:
        'Get natural, conversational speaker notes with timing and presentation tips.',
    },
    {
      icon: Download,
      title: 'Export Anywhere',
      description:
        'Download as editable PowerPoint or present directly in our fullscreen mode.',
    },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-neutral-900">pptx-ai</span>
          </div>
          <Link href="/create">
            <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              Get Started
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-6 bg-gradient-to-b from-white via-blue-50 to-white">
        {/* Gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl" />
          <div className="absolute top-40 -left-40 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-7xl font-bold text-neutral-900 mb-6 leading-tight">
              Create{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Presentations
              </span>
              <br />
              with AI
            </h1>
            <p className="text-xl text-neutral-700 mb-12 max-w-2xl mx-auto">
              Describe your idea and let AI generate professional, visually stunning
              presentations in seconds. No design skills required.
            </p>
          </motion.div>

          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl mx-auto space-y-4"
          >
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="E.g., AI trends for 2024, quarterly sales report, product launch..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={(e) =>
                  e.key === 'Enter' && handleGeneratePresentation()
                }
                className="flex-1 px-6 py-4 bg-white border-2 border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <Button
                onClick={handleGeneratePresentation}
                disabled={isLoading || !prompt.trim()}
                size="lg"
                className="gap-2 px-8 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? 'Generating...' : 'Generate'}
                <Zap className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-sm text-neutral-600">
              No credit card required. Free tier includes up to 5 presentations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-white border-t border-neutral-200">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-neutral-600">
              Everything you need to create stunning presentations
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-8"
          >
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="p-8 bg-white border-2 border-neutral-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-neutral-600">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Templates Section */}
      <section className="py-24 px-6 bg-neutral-50 border-t border-neutral-200">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Beautiful Templates
            </h2>
            <p className="text-xl text-neutral-600">
              Choose from our professionally designed templates
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {TEMPLATES.map((template) => (
              <motion.div
                key={template.id}
                variants={itemVariants}
                className="group relative"
              >
                <div className="relative p-8 bg-white border-2 border-neutral-200 rounded-xl group-hover:border-blue-300 group-hover:shadow-lg transition-all">
                  {/* Template Preview */}
                  <div className="mb-6 h-48 bg-neutral-100 rounded-lg border-2 border-neutral-200 flex items-center justify-center">
                    <div
                      className="w-32 h-32 rounded-lg"
                      style={{
                        backgroundColor: template.colors.background,
                        border: `2px solid ${template.colors.accent}`,
                      }}
                    >
                      <div className="h-full flex flex-col items-center justify-center p-4 gap-2">
                        <div
                          className="w-full h-4 rounded"
                          style={{ backgroundColor: template.colors.title }}
                        />
                        <div
                          className="w-3/4 h-2 rounded"
                          style={{ backgroundColor: template.colors.text }}
                        />
                        <div
                          className="w-3/4 h-2 rounded"
                          style={{ backgroundColor: template.colors.text }}
                        />
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    {template.name}
                  </h3>
                  <p className="text-neutral-600 text-sm">
                    {template.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-neutral-200">
                    <p className="text-xs text-neutral-500 uppercase tracking-wide">
                      {template.layout} layout
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-6 bg-white border-t border-neutral-200">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-neutral-900">
              Ready to create?
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Join thousands of professionals creating presentations with AI. No
              experience needed.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/create">
                <Button size="lg" className="gap-2 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
                  Start Creating
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </Link>
              <button className="px-8 py-3 text-neutral-900 font-medium border-2 border-neutral-300 rounded-lg hover:border-neutral-400 hover:bg-neutral-50 transition-all">
                Learn More
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-12 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center text-neutral-600 text-sm">
          <p>
            © 2024 pptx-ai. Built with{' '}
            <span className="text-blue-600">❤️</span> for creators.
          </p>
        </div>
      </footer>
    </div>
  );
}
