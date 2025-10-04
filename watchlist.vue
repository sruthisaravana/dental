<template>
  <div class="ai-filter-wrapper" :class="{ 'dark-mode': isDarkMode }">
    <!-- AI Filter Trigger Button -->
    <button 
      @click="openAIFilter"
      class="ai-filter-trigger"
      :class="{ 'active': isAIFilterOpen }"
    >
      <Sparkles class="ai-icon" />
      <span>AI Filter</span>
    </button>

    <!-- AI Filter Modal -->
    <UModal 
      v-model="isAIFilterOpen"
      :ui="{ 
        base: 'relative text-left rtl:text-right overflow-hidden !w-screen !h-screen !max-w-none !m-0 flex flex-col', 
        background: isDarkMode ? 'bg-gray-900' : 'bg-white', 
        rounded: '!rounded-none', 
        shadow: 'shadow-none',
        padding: '!p-0'
      }"
    >
      <div class="ai-modal-container">
        <!-- Header -->
        <div class="ai-modal-header">
          <div class="header-content">
            <div class="header-icon-wrapper">
              <Sparkles class="header-icon" />
            </div>
            <div>
              <h3 class="ai-modal-title">AI Watchlist Filter</h3>
              <p class="ai-modal-subtitle">Tell me what you're in the mood for</p>
            </div>
          </div>
          <button @click="closeAIFilter" class="close-btn">
            <XIcon class="close-icon" />
          </button>
        </div>

        <!-- Body -->
        <div class="ai-modal-body">
          <!-- Input Section -->
          <div class="input-section">
            <div class="input-wrapper">
              <textarea
                v-model="userQuery"
                @keydown.enter.ctrl="submitQuery"
                placeholder="E.g., 'romantic and funny movies', 'something intense and thrilling', 'light-hearted comedies for a lazy Sunday'..."
                class="ai-input"
                rows="3"
                :disabled="isLoading"
              ></textarea>
              <div class="input-footer">
                <span class="input-hint">Press Ctrl+Enter to submit</span>
                <span class="char-count">{{ userQuery.length }}/500</span>
              </div>
            </div>

            <!-- Quick Suggestions -->
            <div class="quick-suggestions">
              <span class="suggestions-label">Quick ideas:</span>
              <button 
                v-for="suggestion in quickSuggestions" 
                :key="suggestion"
                @click="userQuery = suggestion"
                class="suggestion-chip"
                :disabled="isLoading"
              >
                {{ suggestion }}
              </button>
            </div>

            <!-- Submit Button -->
            <button 
              @click="submitQuery"
              :disabled="!userQuery.trim() || isLoading"
              class="submit-btn"
            >
              <Loader2 v-if="isLoading" class="loading-icon" />
              <Sparkles v-else class="submit-icon" />
              {{ isLoading ? 'Finding matches...' : 'Find Matches' }}
            </button>
          </div>

          <!-- Loading State -->
          <div v-if="isLoading" class="loading-state">
            <div class="loading-animation">
              <div class="loading-circle"></div>
              <div class="loading-circle"></div>
              <div class="loading-circle"></div>
            </div>
            <p class="loading-text">Analyzing your watchlist with AI...</p>
          </div>

          <!-- Results Section -->
          <div v-if="!isLoading && hasResults" class="results-section">
            <!-- Query Display -->
            <div class="query-display">
              <Brain class="query-icon" />
              <p class="query-text">"{{ originalQuery }}"</p>
            </div>

            <!-- Filtered Bookmarks -->
            <div v-if="filteredBookmarks.length > 0" class="results-group">
              <div class="results-header">
                <h4 class="results-title">
                  <Film class="section-icon" />
                  From Your Watchlist
                </h4>
                <span class="results-count">{{ filteredBookmarks.length }} matches</span>
              </div>
              <div class="movies-grid">
                <div 
                  v-for="movie in filteredBookmarks" 
                  :key="movie.id"
                  class="movie-card"
                  @click="navigateToMovie(movie)"
                >
                  <div class="movie-poster-wrapper">
                    <img 
                      v-if="movie.poster_path"
                      :src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`"
                      :alt="movie.title"
                      class="movie-poster"
                    />
                    <div v-else class="poster-placeholder">
                      <Film class="placeholder-icon" />
                    </div>
                    <div class="movie-overlay">
                      <Play class="play-icon" />
                    </div>
                  </div>
                  <div class="movie-info">
                    <h5 class="movie-title">{{ movie.title }}</h5>
                    <p class="movie-year">{{ movie.year }}</p>
                    <p v-if="movie.match_reason" class="movie-reason">{{ movie.match_reason }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Suggested Items -->
            <div v-if="suggestedItems.length > 0" class="results-group">
              <div class="results-header">
                <h4 class="results-title">
                  <Sparkles class="section-icon" />
                  You Might Also Like
                </h4>
                <span class="results-count">{{ suggestedItems.length }} suggestions</span>
              </div>
              <div class="suggestions-list">
                <div 
                  v-for="(item, index) in suggestedItems" 
                  :key="index"
                  class="suggestion-item"
                >
                  <div class="suggestion-number">{{ index + 1 }}</div>
                  <div class="suggestion-content">
                    <h5 class="suggestion-title">{{ item.title }} <span class="suggestion-year">({{ item.year }})</span></h5>
                    <p class="suggestion-reason">{{ item.reason }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- No Results Message -->
            <div v-if="filteredBookmarks.length === 0 && suggestedItems.length === 0" class="no-results">
              <AlertCircle class="no-results-icon" />
              <p class="no-results-text">No matches found for your query. Try different keywords!</p>
            </div>
          </div>

          <!-- Error State -->
          <div v-if="errorMessage" class="error-state">
            <AlertCircle class="error-icon" />
            <p class="error-text">{{ errorMessage }}</p>
            <button @click="errorMessage = ''" class="dismiss-error">Dismiss</button>
          </div>

          <!-- Info Box when no results yet -->
          <div v-if="!isLoading && !hasResults && !errorMessage" class="info-box">
            <div class="info-icon-wrapper">
              <Sparkles class="info-sparkles" />
            </div>
            <h4 class="info-title">AI-Powered Watchlist Filter</h4>
            <p class="info-description">
              Describe the mood or type of content you're looking for, and our AI will intelligently filter your watchlist and suggest similar titles you might love.
            </p>
            <div class="info-features">
              <div class="feature-item">
                <span class="feature-bullet">✨</span>
                <span>Natural language queries</span>
              </div>
              <div class="feature-item">
                <span class="feature-bullet">🎯</span>
                <span>Smart filtering from your watchlist</span>
              </div>
              <div class="feature-item">
                <span class="feature-bullet">🎬</span>
                <span>Personalized recommendations</span>
              </div>
            </div>
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
import { useRouter } from 'vue-router';

const props = defineProps({
  isDarkMode: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['filtered-results']);

const router = useRouter();
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
      .split("; ")
      .find((row) => row.startsWith("access_token"));
    return cookie ? cookie.split("=")[1] : null;
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

<style scoped>
/* CSS Variables - Dark Mode Only */
.ai-filter-wrapper {
  --ai-primary: #6366f1;
  --ai-secondary: #4f46e5;
  --ai-accent: #818cf8;
  --ai-glow: rgba(99, 102, 241, 0.4);
  
  /* Dark Mode Colors */
  --bg-primary: #0a0e1a;
  --bg-secondary: #111827;
  --bg-tertiary: #1f2937;
  --bg-card: #1e293b;
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-tertiary: #94a3b8;
  --border-color: #334155;
  --border-light: #1e293b;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.5);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
  --success: #10b981;
  --error: #ef4444;
}

/* Trigger Button - Redesigned */
.ai-filter-trigger {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 24px;
  background: linear-gradient(135deg, var(--ai-primary) 0%, var(--ai-secondary) 100%);
  border: none;
  border-radius: 14px;
  color: #ffffff;
  font-weight: 600;
  font-size: 15px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 14px var(--ai-glow), 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.ai-filter-trigger::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.ai-filter-trigger:hover::before {
  left: 100%;
}

.ai-filter-trigger:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 20px var(--ai-glow), 0 4px 8px rgba(0, 0, 0, 0.15);
}

.ai-filter-trigger:active {
  transform: translateY(0) scale(0.98);
}

.ai-icon {
  width: 20px;
  height: 20px;
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.5));
  animation: sparkle 3s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% { 
    transform: rotate(0deg) scale(1);
    opacity: 1;
  }
  25% { 
    transform: rotate(-15deg) scale(1.15);
    opacity: 0.9;
  }
  50% { 
    transform: rotate(0deg) scale(1);
    opacity: 1;
  }
  75% { 
    transform: rotate(15deg) scale(1.15);
    opacity: 0.9;
  }
}

/* Modal Container - Redesigned */
.ai-modal-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background: var(--bg-primary);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
}

/* Modal Header - Redesigned */
.ai-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28px 48px;
  border-bottom: 2px solid var(--border-color);
  background: linear-gradient(135deg, 
    rgba(99, 102, 241, 0.08) 0%, 
    rgba(79, 70, 229, 0.05) 50%,
    var(--bg-primary) 100%);
  backdrop-filter: blur(20px);
  position: relative;
}

.ai-modal-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    var(--ai-primary) 50%, 
    transparent 100%);
  opacity: 0.3;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--ai-primary) 0%, var(--ai-secondary) 100%);
  border-radius: 18px;
  box-shadow: 0 8px 32px var(--ai-glow), 0 4px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}

.header-icon-wrapper::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(135deg, var(--ai-primary), var(--ai-secondary));
  border-radius: 20px;
  opacity: 0.3;
  filter: blur(8px);
  z-index: -1;
}

.header-icon {
  width: 28px;
  height: 28px;
  color: #ffffff;
  filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.6));
  animation: sparkle 3s ease-in-out infinite;
}

.ai-modal-title {
  font-size: 28px;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
  letter-spacing: -0.5px;
}

.ai-modal-subtitle {
  font-size: 15px;
  color: #cbd5e1;
  margin: 6px 0 0 0;
  font-weight: 500;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--bg-tertiary);
  border: 2px solid var(--border-color);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.close-btn:hover {
  background: var(--ai-primary);
  border-color: var(--ai-primary);
  transform: rotate(90deg) scale(1.05);
  box-shadow: 0 4px 16px var(--ai-glow);
}

.close-icon {
  width: 22px;
  height: 22px;
  color: var(--text-secondary);
  stroke-width: 2.5;
  transition: color 0.3s ease;
}

.close-btn:hover .close-icon {
  color: #ffffff;
}

/* Modal Body - Redesigned */
.ai-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 40px 48px;
  background: #0f1623;
  position: relative;
}

.ai-modal-body::-webkit-scrollbar {
  width: 10px;
}

.ai-modal-body::-webkit-scrollbar-track {
  background: var(--bg-primary);
  border-radius: 10px;
}

.ai-modal-body::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 10px;
  transition: background 0.3s ease;
}

.ai-modal-body::-webkit-scrollbar-thumb:hover {
  background: var(--ai-primary);
}

/* Input Section - Redesigned */
.input-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 32px;
  padding: 32px;
  background: #1a2332;
  border-radius: 20px;
  border: 2px solid #334155;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  position: relative;
  overflow: hidden;
}

.input-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, 
    var(--ai-primary) 0%, 
    var(--ai-secondary) 50%, 
    var(--ai-accent) 100%);
  opacity: 0.6;
}

.input-wrapper {
  position: relative;
}

.ai-input {
  width: 100%;
  padding: 18px 20px;
  border: 2px solid #475569;
  border-radius: 14px;
  background: #1e293b;
  color: #f8fafc;
  font-size: 16px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  line-height: 1.6;
  resize: vertical;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 140px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.ai-input:focus {
  outline: none;
  border-color: var(--ai-primary);
  box-shadow: 0 0 0 4px var(--ai-glow), 0 8px 16px rgba(0, 0, 0, 0.4);
  background: #2d3748;
}

.ai-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--bg-tertiary);
}

.ai-input::placeholder {
  color: #cbd5e1;
  font-weight: 400;
  opacity: 0.7;
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding: 0 4px;
}

.input-hint {
  font-size: 13px;
  color: #cbd5e1;
  font-weight: 500;
}

.char-count {
  font-size: 13px;
  color: #cbd5e1;
  font-weight: 600;
  padding: 4px 10px;
  background: #2d3748;
  border-radius: 8px;
  border: 1px solid #475569;
}

/* Quick Suggestions - Redesigned */
.quick-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.suggestions-label {
  font-size: 14px;
  font-weight: 700;
  color: #f8fafc;
  margin-right: 4px;
  letter-spacing: -0.2px;
}

.suggestion-chip {
  padding: 10px 18px;
  background: #2d3748;
  border: 2px solid #475569;
  border-radius: 24px;
  color: #f8fafc;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.suggestion-chip::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.1), transparent);
  transition: left 0.5s ease;
}

.suggestion-chip:hover::before {
  left: 100%;
}

.suggestion-chip:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--ai-primary), var(--ai-secondary));
  color: #ffffff;
  border-color: var(--ai-primary);
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 16px var(--ai-glow);
}

.suggestion-chip:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.suggestion-chip:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: var(--bg-tertiary);
}

/* Submit Button - Redesigned */
.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 40px;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  border: none;
  border-radius: 14px;
  color: #ffffff;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.5), 0 4px 8px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.submit-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.submit-btn:hover::before {
  width: 300px;
  height: 300px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 12px 40px rgba(99, 102, 241, 0.6), 0 6px 16px rgba(0, 0, 0, 0.4);
  background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(-1px) scale(0.98);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  background: var(--bg-tertiary);
  box-shadow: none;
}

.submit-icon,
.loading-icon {
  width: 20px;
  height: 20px;
  z-index: 1;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Loading State - Redesigned */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 32px;
  background: var(--bg-card);
  border-radius: 20px;
  border: 2px solid var(--border-color);
  box-shadow: var(--shadow-lg);
}

.loading-animation {
  display: flex;
  gap: 14px;
  margin-bottom: 28px;
}

.loading-circle {
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, var(--ai-primary), var(--ai-secondary));
  border-radius: 50%;
  box-shadow: 0 4px 12px var(--ai-glow);
  animation: bounce 1.4s ease-in-out infinite;
}

.loading-circle:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-circle:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0) translateY(0);
    opacity: 0.3;
  }
  40% {
    transform: scale(1.2) translateY(-10px);
    opacity: 1;
  }
}

.loading-text {
  font-size: 17px;
  color: #f8fafc;
  font-weight: 600;
  letter-spacing: -0.3px;
}

/* Results Section */
.results-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.query-display {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 24px;
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: 16px;
  border-left: 5px solid var(--ai-primary);
  box-shadow: var(--shadow-md);
  margin-bottom: 24px;
}

.query-icon {
  width: 22px;
  height: 22px;
  color: var(--ai-primary);
  flex-shrink: 0;
  margin-top: 2px;
  filter: drop-shadow(0 0 4px var(--ai-glow));
}

.query-text {
  font-size: 15px;
  color: #f8fafc;
  font-style: italic;
  font-weight: 500;
  line-height: 1.6;
  margin: 0;
}

/* Results Group - Redesigned */
.results-group {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 32px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 3px solid var(--border-color);
  position: relative;
}

.results-header::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 0;
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, var(--ai-primary), var(--ai-secondary));
  border-radius: 3px;
}

.results-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 22px;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
  letter-spacing: -0.5px;
}

.section-icon {
  width: 24px;
  height: 24px;
  color: var(--ai-primary);
  filter: drop-shadow(0 0 4px var(--ai-glow));
}

.results-count {
  padding: 6px 16px;
  background: linear-gradient(135deg, var(--ai-primary), var(--ai-secondary));
  color: #ffffff;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 700;
  box-shadow: 0 4px 12px var(--ai-glow);
}

/* Movies Grid - Redesigned */
.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 24px;
}

.movie-card {
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px;
  overflow: hidden;
}

.movie-card:hover {
  transform: translateY(-6px);
}

.movie-poster-wrapper {
  position: relative;
  aspect-ratio: 2/3;
  border-radius: 16px;
  overflow: hidden;
  background: var(--bg-tertiary);
  box-shadow: var(--shadow-lg);
  border: 2px solid var(--border-color);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.movie-card:hover .movie-poster-wrapper {
  box-shadow: 0 12px 40px var(--shadow-medium), 0 0 0 3px var(--ai-primary);
  border-color: var(--ai-primary);
}

.movie-poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.poster-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
}

.placeholder-icon {
  width: 48px;
  height: 48px;
  color: var(--text-tertiary);
}

.movie-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, 
    rgba(99, 102, 241, 0.9) 0%, 
    rgba(79, 70, 229, 0.9) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(4px);
}

.movie-card:hover .movie-overlay {
  opacity: 1;
}

.play-icon {
  width: 56px;
  height: 56px;
  color: #ffffff;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.movie-info {
  padding: 12px 0;
}

.movie-title {
  font-size: 15px;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 6px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.3;
  letter-spacing: -0.2px;
}

.movie-year {
  font-size: 13px;
  color: #cbd5e1;
  margin: 0 0 10px 0;
  font-weight: 600;
  background: #2d3748;
  display: inline-block;
  padding: 3px 10px;
  border-radius: 8px;
  border: 1px solid #475569;
}

.movie-reason {
  font-size: 13px;
  color: #cbd5e1;
  line-height: 1.5;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  font-weight: 500;
}

/* Suggestions List */
.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.suggestion-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: var(--bg-tertiary);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.dark-mode .suggestion-item {
  background: var(--bg-tertiary);
}

.suggestion-item:hover {
  border-color: var(--ai-primary);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
  transform: translateY(-2px);
}

.suggestion-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--ai-primary), var(--ai-secondary));
  color: white;
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.suggestion-content {
  flex: 1;
}

.suggestion-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.suggestion-year {
  color: var(--text-tertiary);
  font-weight: 400;
}

.suggestion-reason {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

/* No Results */
.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.no-results-icon {
  width: 48px;
  height: 48px;
  color: var(--text-tertiary);
  margin-bottom: 16px;
}

.no-results-text {
  font-size: 15px;
  color: var(--text-secondary);
  margin: 0;
}

/* Error State - Redesigned */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 32px;
  text-align: center;
  background: var(--bg-card);
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: 20px;
  margin: 20px 0;
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.15);
  position: relative;
  overflow: hidden;
}

.error-state::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.error-icon {
  width: 56px;
  height: 56px;
  color: #ef4444;
  margin-bottom: 20px;
  filter: drop-shadow(0 4px 12px rgba(239, 68, 68, 0.3));
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.error-text {
  font-size: 16px;
  color: #f8fafc;
  line-height: 1.7;
  margin: 0 0 24px 0;
  max-width: 600px;
  font-weight: 500;
}

.dismiss-error {
  padding: 12px 28px;
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  color: #f8fafc;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-sm);
}

.dismiss-error:hover {
  background: var(--ai-primary);
  color: #ffffff;
  border-color: var(--ai-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px var(--ai-glow);
}

/* Info Box - Redesigned */
.info-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 56px 48px;
  background: #1a2332;
  border: 2px solid #334155;
  border-radius: 24px;
  text-align: center;
  margin: 20px 0;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  position: relative;
  overflow: hidden;
}

.info-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, 
    var(--ai-primary) 0%, 
    var(--ai-secondary) 50%, 
    var(--ai-accent) 100%);
}

.info-icon-wrapper {
  width: 96px;
  height: 96px;
  background: linear-gradient(135deg, var(--ai-primary) 0%, var(--ai-secondary) 100%);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 28px;
  box-shadow: 0 12px 40px var(--ai-glow), 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
}

.info-icon-wrapper::before {
  content: '';
  position: absolute;
  inset: -3px;
  background: linear-gradient(135deg, var(--ai-primary), var(--ai-secondary));
  border-radius: 27px;
  opacity: 0.3;
  filter: blur(12px);
  z-index: -1;
}

.info-sparkles {
  width: 40px;
  height: 40px;
  color: #ffffff;
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.6));
  animation: sparkle 3s ease-in-out infinite;
}

.info-title {
  font-size: 28px;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 16px 0;
  letter-spacing: -0.5px;
}

.info-description {
  font-size: 17px;
  line-height: 1.7;
  color: #cbd5e1;
  margin: 0 0 40px 0;
  max-width: 650px;
  font-weight: 500;
}

.info-features {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: flex-start;
  background: #0f1623;
  padding: 24px 32px;
  border-radius: 16px;
  border: 2px solid #475569;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 16px;
  color: #f8fafc;
  font-weight: 500;
}

.feature-bullet {
  font-size: 22px;
  flex-shrink: 0;
  line-height: 1;
}

/* Responsive Design - Redesigned */
@media (max-width: 768px) {
  .ai-modal-header {
    padding: 20px 24px;
  }

  .header-icon-wrapper {
    width: 48px;
    height: 48px;
  }

  .header-icon {
    width: 22px;
    height: 22px;
  }

  .ai-modal-title {
    font-size: 22px;
  }

  .ai-modal-subtitle {
    font-size: 13px;
  }

  .ai-modal-body {
    padding: 24px 20px;
  }

  .input-section {
    padding: 24px 20px;
  }

  .ai-input {
    font-size: 15px;
    min-height: 120px;
  }

  .submit-btn {
    padding: 14px 32px;
    font-size: 15px;
  }

  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 16px;
  }

  .suggestion-item {
    flex-direction: column;
    gap: 12px;
  }

  .info-box {
    padding: 32px 24px;
  }

  .info-features {
    width: 100%;
    padding: 20px 24px;
  }

  .results-title {
    font-size: 18px;
  }

  .close-btn {
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 480px) {
  .ai-filter-trigger {
    padding: 10px 18px;
    font-size: 14px;
  }

  .ai-modal-header {
    padding: 16px;
  }

  .ai-modal-title {
    font-size: 20px;
  }

  .suggestion-chip {
    font-size: 13px;
    padding: 8px 14px;
  }

  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
  }
}
</style>
