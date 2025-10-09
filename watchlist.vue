<template>
  <div
    class="relative inline-flex"
    :class="isDarkMode ? 'text-slate-100' : 'text-slate-900'"
  >
    <button
      @click="openAIFilter"
      class="group inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      :class="[
        isDarkMode
          ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 text-white shadow-lg shadow-indigo-500/30 focus-visible:ring-indigo-300 focus-visible:ring-offset-slate-950'
          : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 text-white shadow-lg shadow-indigo-500/30 focus-visible:ring-indigo-600 focus-visible:ring-offset-white',
        isAIFilterOpen ? 'ring-2 ring-offset-2 ring-indigo-400' : 'hover:shadow-xl hover:shadow-indigo-500/40'
      ]"
    >
      <Sparkles class="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
      <span>AI Filter</span>
    </button>

    <UModal
      v-model="isAIFilterOpen"
      :ui="{
        base: 'relative text-left overflow-hidden !w-screen !h-screen !max-w-none !m-0 flex flex-col',
        background: isDarkMode ? 'bg-slate-950' : 'bg-slate-50',
        rounded: '!rounded-none',
        shadow: 'shadow-none',
        padding: '!p-0'
      }"
    >
      <div class="flex h-full flex-col" :class="isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'">
        <div
          class="flex items-start justify-between gap-6 border-b px-10 py-8"
          :class="isDarkMode ? 'border-slate-800/80 bg-slate-950/80' : 'border-slate-200 bg-white/70'"
        >
          <div class="flex items-start gap-4">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-2xl"
              :class="isDarkMode ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-inset ring-indigo-500/40' : 'bg-indigo-100 text-indigo-600 ring-1 ring-inset ring-indigo-200'"
            >
              <Sparkles class="h-6 w-6" />
            </div>
            <div>
              <h3 class="text-2xl font-semibold tracking-tight">Tune your watchlist with AI</h3>
              <p class="mt-1 text-sm leading-relaxed" :class="isDarkMode ? 'text-slate-300' : 'text-slate-600'">
                Describe the mood, pace or themes you're craving. We'll surface the perfect matches from your saved titles and suggest a few fresh finds.
              </p>
            </div>
          </div>
          <button
            @click="closeAIFilter"
            class="flex h-11 w-11 items-center justify-center rounded-xl border text-sm font-medium transition hover:scale-105 focus:outline-none focus-visible:ring-2"
            :class="isDarkMode ? 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-indigo-500 hover:text-white focus-visible:ring-indigo-400' : 'border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:text-indigo-500 focus-visible:ring-indigo-500'"
          >
            <span class="sr-only">Close</span>
            <XIcon class="h-5 w-5" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-10 py-8">
          <div class="mx-auto flex w-full max-w-5xl flex-col gap-10">
            <section
              class="relative overflow-hidden rounded-3xl border px-8 py-8 shadow-lg transition"
              :class="isDarkMode ? 'border-slate-800/80 bg-slate-900/70 shadow-black/40' : 'border-slate-200 bg-white shadow-slate-200/60'"
            >
              <div class="absolute inset-y-0 right-0 hidden w-72 bg-gradient-to-l from-indigo-500/10 to-transparent md:block" />
              <header class="flex flex-col gap-2 pb-6">
                <h4 class="text-lg font-semibold">Share what you're in the mood for</h4>
                <p class="text-sm" :class="isDarkMode ? 'text-slate-300' : 'text-slate-600'">
                  Use natural language&mdash;anything from "slow-burn mysteries" to "optimistic sci-fi for family night". We'll do the rest.
                </p>
              </header>

              <div class="flex flex-col gap-6">
                <div class="space-y-3">
                  <textarea
                    v-model="userQuery"
                    @keydown.enter.ctrl="submitQuery"
                    rows="3"
                    :disabled="isLoading"
                    placeholder="e.g. 'romantic and funny movies' or 'smart thrillers with a twist'"
                    class="w-full resize-none rounded-2xl border px-4 py-4 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    :class="[
                      isDarkMode
                        ? 'border-slate-700 bg-slate-900/70 text-slate-100 placeholder:text-slate-500'
                        : 'border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400',
                      isLoading ? 'opacity-70' : 'hover:border-indigo-400'
                    ]"
                  ></textarea>
                  <div class="flex flex-wrap items-center justify-between gap-3 text-xs" :class="isDarkMode ? 'text-slate-400' : 'text-slate-500'">
                    <span>Press <kbd class="rounded-md border px-1.5 py-0.5" :class="isDarkMode ? 'border-slate-700 bg-slate-900 text-slate-300' : 'border-slate-200 bg-white text-slate-600'">Ctrl</kbd> + <kbd class="rounded-md border px-1.5 py-0.5" :class="isDarkMode ? 'border-slate-700 bg-slate-900 text-slate-300' : 'border-slate-200 bg-white text-slate-600'">Enter</kbd> to submit</span>
                    <span>{{ userQuery.length }}/500</span>
                  </div>
                </div>

                <div class="flex flex-wrap gap-2">
                  <span class="text-xs font-semibold uppercase tracking-wide" :class="isDarkMode ? 'text-slate-400' : 'text-slate-500'">Try one:</span>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="suggestion in quickSuggestions"
                      :key="suggestion"
                      @click="userQuery = suggestion"
                      :disabled="isLoading"
                      class="rounded-full px-4 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2"
                      :class="isDarkMode ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 focus-visible:ring-indigo-400' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 focus-visible:ring-indigo-500'"
                    >
                      {{ suggestion }}
                    </button>
                  </div>
                </div>

                <div class="flex justify-end">
                  <button
                    @click="submitQuery"
                    :disabled="!userQuery.trim() || isLoading"
                    class="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Loader2 v-if="isLoading" class="h-5 w-5 animate-spin" />
                    <Sparkles v-else class="h-5 w-5" />
                    {{ isLoading ? 'Finding matches...' : 'Find Matches' }}
                  </button>
                </div>
              </div>
            </section>

            <div v-if="isLoading" class="flex flex-col items-center gap-4 rounded-3xl border px-8 py-12 text-center shadow-lg" :class="isDarkMode ? 'border-slate-800/80 bg-slate-900/60 shadow-black/30' : 'border-slate-200 bg-white shadow-slate-200/60'">
              <div class="flex gap-2">
                <span class="h-3 w-3 animate-bounce rounded-full" :class="isDarkMode ? 'bg-indigo-400' : 'bg-indigo-500'" style="animation-delay: 0s"></span>
                <span class="h-3 w-3 animate-bounce rounded-full" :class="isDarkMode ? 'bg-indigo-400' : 'bg-indigo-500'" style="animation-delay: .15s"></span>
                <span class="h-3 w-3 animate-bounce rounded-full" :class="isDarkMode ? 'bg-indigo-400' : 'bg-indigo-500'" style="animation-delay: .3s"></span>
              </div>
              <p class="text-sm" :class="isDarkMode ? 'text-slate-300' : 'text-slate-600'">Analyzing your watchlist with AI...</p>
            </div>

            <section v-if="!isLoading && hasResults" class="flex flex-col gap-10">
              <div class="flex flex-wrap items-center gap-3 rounded-2xl border px-6 py-4" :class="isDarkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'">
                <Brain class="h-5 w-5 text-indigo-400" />
                <p class="text-sm" :class="isDarkMode ? 'text-slate-300' : 'text-slate-600'">{{ originalQuery }}</p>
              </div>

              <div v-if="filteredBookmarks.length > 0" class="space-y-6">
                <div class="flex flex-wrap items-center justify-between gap-4">
                  <h4 class="flex items-center gap-2 text-lg font-semibold">
                    <Film class="h-5 w-5 text-indigo-400" />
                    From your watchlist
                  </h4>
                  <span class="text-sm font-medium" :class="isDarkMode ? 'text-slate-400' : 'text-slate-600'">{{ filteredBookmarks.length }} matches</span>
                </div>
                <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div
                    v-for="movie in filteredBookmarks"
                    :key="movie.id"
                    class="group flex cursor-pointer flex-col overflow-hidden rounded-3xl border shadow transition hover:-translate-y-1 hover:shadow-xl"
                    :class="isDarkMode ? 'border-slate-800 bg-slate-900/70 shadow-black/30' : 'border-slate-200 bg-white shadow-slate-200/70'"
                    @click="navigateToMovie(movie)"
                  >
                    <div class="relative aspect-[2/3] overflow-hidden">
                      <img
                        v-if="movie.poster_path"
                        :src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`"
                        :alt="movie.title"
                        class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      <div v-else class="flex h-full w-full items-center justify-center bg-slate-800/60">
                        <Film class="h-10 w-10 text-slate-500" />
                      </div>
                      <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent opacity-0 transition group-hover:opacity-100">
                        <div class="absolute bottom-4 left-4 flex items-center gap-2 text-sm font-semibold text-white">
                          <Play class="h-4 w-4" />
                          View details
                        </div>
                      </div>
                    </div>
                    <div class="flex flex-1 flex-col gap-2 px-5 py-4">
                      <h5 class="text-base font-semibold leading-snug">{{ movie.title }}</h5>
                      <p class="text-sm" :class="isDarkMode ? 'text-slate-400' : 'text-slate-500'">{{ movie.year }}</p>
                      <p v-if="movie.match_reason" class="text-sm" :class="isDarkMode ? 'text-indigo-300' : 'text-indigo-600'">{{ movie.match_reason }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="suggestedItems.length > 0" class="space-y-6">
                <div class="flex flex-wrap items-center justify-between gap-4">
                  <h4 class="flex items-center gap-2 text-lg font-semibold">
                    <Sparkles class="h-5 w-5 text-indigo-400" />
                    You might also like
                  </h4>
                  <span class="text-sm font-medium" :class="isDarkMode ? 'text-slate-400' : 'text-slate-600'">{{ suggestedItems.length }} suggestions</span>
                </div>
                <div class="space-y-4">
                  <div
                    v-for="(item, index) in suggestedItems"
                    :key="index"
                    class="flex gap-4 rounded-2xl border px-5 py-4 shadow-sm"
                    :class="isDarkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'"
                  >
                    <div class="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold" :class="isDarkMode ? 'bg-indigo-500/20 text-indigo-200' : 'bg-indigo-100 text-indigo-600'">
                      {{ index + 1 }}
                    </div>
                    <div class="space-y-1">
                      <h5 class="text-base font-semibold">
                        {{ item.title }}
                        <span class="text-sm font-medium" :class="isDarkMode ? 'text-slate-400' : 'text-slate-500'">({{ item.year }})</span>
                      </h5>
                      <p class="text-sm leading-relaxed" :class="isDarkMode ? 'text-slate-300' : 'text-slate-600'">{{ item.reason }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="filteredBookmarks.length === 0 && suggestedItems.length === 0" class="flex flex-col items-center gap-3 rounded-2xl border px-8 py-12 text-center" :class="isDarkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'">
                <AlertCircle class="h-6 w-6 text-amber-400" />
                <p class="text-sm font-medium" :class="isDarkMode ? 'text-slate-300' : 'text-slate-600'">No matches found. Try different keywords or broaden your description.</p>
              </div>
            </section>

            <div
              v-if="errorMessage"
              class="flex items-start gap-3 rounded-2xl border px-6 py-4 text-sm"
              :class="isDarkMode ? 'border-red-500/40 bg-red-500/10 text-red-200' : 'border-red-200 bg-red-50 text-red-700'"
            >
              <AlertCircle class="h-5 w-5" />
              <div class="flex flex-1 flex-col gap-2">
                <p>{{ errorMessage }}</p>
                <button
                  @click="errorMessage = ''"
                  class="self-start rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition"
                  :class="isDarkMode ? 'border-red-400/40 hover:bg-red-500/20' : 'border-red-200 hover:bg-red-100'"
                >
                  Dismiss
                </button>
              </div>
            </div>

            <section
              v-if="!isLoading && !hasResults && !errorMessage"
              class="grid gap-6 rounded-3xl border px-8 py-10 shadow-lg md:grid-cols-[minmax(0,1fr),minmax(0,1fr)]"
              :class="isDarkMode ? 'border-slate-800 bg-slate-900/60 shadow-black/30' : 'border-slate-200 bg-white shadow-slate-200/60'"
            >
              <div class="space-y-4">
                <h4 class="text-xl font-semibold">How the AI filter helps</h4>
                <p class="text-sm leading-relaxed" :class="isDarkMode ? 'text-slate-300' : 'text-slate-600'">
                  We translate your prompt into cinematic traits, compare them against your saved titles and surface extra recommendations that share the same vibe.
                </p>
                <ul class="space-y-3 text-sm" :class="isDarkMode ? 'text-slate-300' : 'text-slate-600'">
                  <li class="flex items-start gap-2"><span class="mt-1 text-indigo-400">&bull;</span><span>Blend moods, genres or references&mdash;the model understands natural descriptions.</span></li>
                  <li class="flex items-start gap-2"><span class="mt-1 text-indigo-400">&bull;</span><span>Quickly spotlight relevant items from your watchlist without manual scanning.</span></li>
                  <li class="flex items-start gap-2"><span class="mt-1 text-indigo-400">&bull;</span><span>Get complementary picks to keep your queue fresh.</span></li>
                </ul>
              </div>
              <div class="flex flex-col justify-center gap-4 rounded-2xl border px-6 py-6 text-sm" :class="isDarkMode ? 'border-slate-800 bg-slate-950/70' : 'border-slate-200 bg-slate-50'">
                <h5 class="text-base font-semibold">Tips for great prompts</h5>
                <ul class="space-y-3" :class="isDarkMode ? 'text-slate-300' : 'text-slate-600'">
                  <li>
                    <span class="font-medium text-indigo-400">Add context:</span> mention tone ("light-hearted"), pace ("slow-burn") or company ("for a family movie night").
                  </li>
                  <li>
                    <span class="font-medium text-indigo-400">Reference favorites:</span> call out a title you love so the AI can mirror its feel.
                  </li>
                  <li>
                    <span class="font-medium text-indigo-400">Set limits:</span> include runtime, release era or language preferences if needed.
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import {
  Sparkles, XIcon, Loader2, Brain, Film, Play,
  AlertCircle
} from 'lucide-vue-next';
import axios from 'axios';

const props = defineProps({
  isDarkMode: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['filtered-results']);
const config = useRuntimeConfig();

// State
const isAIFilterOpen = ref(false);
const isLoading = ref(false);
const userQuery = ref('');
const originalQuery = ref('');
const filteredBookmarks = ref([]);
const suggestedItems = ref([]);
const errorMessage = ref('');

// Quick suggestion chips
const quickSuggestions = [
  'romantic and sexy',
  'action-packed thrillers',
  'feel-good comedies',
  'dark and intense',
  'family-friendly adventures'
];

// Computed
const hasResults = computed(() => {
  return filteredBookmarks.value.length > 0 || suggestedItems.value.length > 0;
});

// Methods
const openAIFilter = () => {
  isAIFilterOpen.value = true;
  errorMessage.value = '';
};

const closeAIFilter = () => {
  isAIFilterOpen.value = false;
};

const getAccessToken = () => {
  if (process.client) {
    const cookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('access_token'));
    return cookie ? cookie.split('=')[1] : null;
  }
  return null;
};

const submitQuery = async () => {
  if (!userQuery.value.trim() || isLoading.value) return;

  const token = getAccessToken();
  if (!token) {
    errorMessage.value = 'Please log in to use AI filtering';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';
  filteredBookmarks.value = [];
  suggestedItems.value = [];

  try {
    const response = await axios.post(
      `${config.public.API_BASE_URL}/ai/recommend-from-bookmarks`,
      {
        query: userQuery.value.trim(),
        max_suggestions: 5
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (response.data.success) {
      originalQuery.value = response.data.query;
      filteredBookmarks.value = response.data.filtered || [];
      suggestedItems.value = response.data.suggestions || [];

      // Emit filtered results to parent
      emit('filtered-results', {
        filtered: filteredBookmarks.value,
        suggested: suggestedItems.value,
        query: originalQuery.value
      });
    }
  } catch (error) {
    console.error('AI Filter Error:', error);
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      errorMessage.value = 'Cannot connect to AI service. Please make sure the backend server is running.';
    } else if (error.response?.status === 404) {
      errorMessage.value = 'No bookmarks found in your watchlist';
    } else if (error.response?.status === 500) {
      errorMessage.value = 'AI service not configured. Please check MISTRAL_API_KEY in backend environment.';
    } else if (error.response?.status === 502) {
      errorMessage.value = 'AI service is temporarily unavailable. The endpoint may not be deployed yet or the Mistral API key is missing.';
    } else if (error.response?.status === 504) {
      errorMessage.value = 'Request timeout. Please try again';
    } else {
      errorMessage.value = error.response?.data?.error || 'Failed to process your request. Please try again.';
    }
  } finally {
    isLoading.value = false;
  }
};

const navigateToMovie = (movie) => {
  // Open movie details page in new tab
  if (movie.media_type === 'nmovies') {
    // Use format /nmovies/{movie_id}
    window.open(`/nmovies/${movie.id}`, '_blank');
  } else if (movie.media_type === 'tv_shows') {
    // Use format /tv/{movie_id}
    window.open(`/tv/${movie.id}`, '_blank');
  }
};
</script>
