<template>
  <div class="relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6 rounded-xl shadow-xl w-full border border-blue-200 dark:border-gray-700">
    <!-- Enhanced Header -->
    <div class="mb-6 relative">
      <!-- Title, Tabs and Legend Sections -->
      <div class="flex items-start gap-4">
        <!-- Title and Tabs Section -->
        <div class="flex flex-col flex-shrink-0">
          <h3 class="text-xl font-bold text-gray-800 dark:text-white flex items-center mb-3">
             Dental Chart
          </h3>
          
          <!-- Tab System -->
          <div class="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button 
              @click="activeTab = 'adult'"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                activeTab === 'adult' 
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              ]"
            >
              Adult Teeth
            </button>
            <button 
              @click="activeTab = 'children'"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                activeTab === 'children' 
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              ]"
            >
              Children's Teeth
            </button>
          </div>
        </div>

        <!-- Spacer to push boxes to the right -->
        <div class="flex-1"></div>

        <!-- Condition Legend with reduced width -->
        <div class="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-sm border border-gray-200 dark:border-gray-700 h-20 flex flex-col">
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Common Conditions</h4>
          <div class="flex flex-wrap gap-x-3 gap-y-1 text-xs">
            <div class="flex items-center whitespace-nowrap">
              <span class="h-3 w-3 bg-emerald-400 rounded mr-2 flex-shrink-0"></span>
              <span class="text-gray-700 dark:text-gray-300">Healthy</span>
            </div>
            <div class="flex items-center whitespace-nowrap">
              <span class="h-3 w-3 bg-rose-400 rounded mr-2 flex-shrink-0"></span>
              <span class="text-gray-700 dark:text-gray-300">Decayed</span>
            </div>
            <div class="flex items-center whitespace-nowrap">
              <span class="h-3 w-3 bg-sky-400 rounded mr-2 flex-shrink-0"></span>
              <span class="text-gray-700 dark:text-gray-300">Filled</span>
            </div>
            <div class="flex items-center whitespace-nowrap">
              <span class="h-3 w-3 bg-slate-400 rounded mr-2 flex-shrink-0"></span>
              <span class="text-gray-700 dark:text-gray-300">Missing</span>
            </div>
            <div class="flex items-center whitespace-nowrap">
              <span class="h-3 w-3 bg-orange-400 rounded mr-2 flex-shrink-0"></span>
              <span class="text-gray-700 dark:text-gray-300">Cracked</span>
            </div>
            <div class="flex items-center whitespace-nowrap">
              <span class="h-3 w-3 bg-violet-400 rounded mr-2 flex-shrink-0"></span>
              <span class="text-gray-700 dark:text-gray-300">Wisdom</span>
            </div>
          </div>
        </div>

        <!-- Treatment Status Legend -->
        <div class="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-sm border border-gray-200 dark:border-gray-700 h-20 flex flex-col">
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Treatment Status</h4>
          <div class="flex flex-wrap gap-x-3 gap-y-1 text-xs">
            <div class="flex items-center whitespace-nowrap">
              <span class="h-2 w-2 bg-sky-400 rounded-full mr-1.5"></span>
              <span class="text-sky-600 dark:text-sky-300">Initial</span>
            </div>
            <div class="flex items-center whitespace-nowrap">
              <span class="h-2 w-2 bg-purple-400 rounded-full mr-1.5"></span>
              <span class="text-purple-600 dark:text-purple-300">Diagnosed</span>
            </div>
            <div class="flex items-center whitespace-nowrap">
              <span class="h-2 w-2 bg-amber-400 rounded-full mr-1.5"></span>
              <span class="text-amber-600 dark:text-amber-300">Treatment</span>
            </div>
            <div class="flex items-center whitespace-nowrap">
              <span class="h-2 w-2 bg-emerald-400 rounded-full mr-1.5"></span>
              <span class="text-emerald-600 dark:text-emerald-300">Complete</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Enhanced Dental Chart with improved styling -->
    <div class="relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <!-- Adult Teeth Chart -->
      <div v-if="activeTab === 'adult'" class="adult-chart">
        <!-- Quadrant Labels -->
        <div class="absolute top-2 left-2 text-xs text-gray-500 dark:text-gray-400 font-semibold">Q2</div>
        <div class="absolute top-2 right-2 text-xs text-gray-500 dark:text-gray-400 font-semibold">Q1</div>
        <div class="absolute bottom-2 left-2 text-xs text-gray-500 dark:text-gray-400 font-semibold">Q3</div>
        <div class="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400 font-semibold">Q4</div>
        
        <!-- Enhanced Quadrant Dividing Lines -->
        <div class="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent dark:via-blue-500 transform -translate-y-1/2"></div>
        <div class="absolute top-0 bottom-0 left-1/2 w-0.5 bg-gradient-to-b from-transparent via-blue-400 to-transparent dark:via-blue-500 transform -translate-x-1/2"></div>

        <!-- Upper Jaw -->
        <div class="grid grid-cols-16 gap-0 mb-3 justify-items-center">
          <!-- Upper Right (Quadrant 1: 11-18) -->
          <div v-for="n in 8" :key="'upper-right-' + (19 - n)" class="relative text-center tooth-item">
              <button
                @click="handleToothClick(19 - n)"
                @mouseenter="handleToothHover(19 - n, $event)"
                @mouseleave="handleToothLeave"
                draggable="true"
                @dragstart="handleChartToothDragStart($event, 19 - n)"
                @dragend="handleDragEnd"
                class="focus:outline-none flex flex-col items-center w-full relative group transition-all duration-200 hover:scale-110 hover:z-10">
              <div class="relative">
                <!-- Critical indicator (red dot) -->
                <span v-if="hasCriticalTreatment(19 - n)" class="absolute -top-1 -left-1 h-3 w-3 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-800 z-20 animate-pulse"></span>
                <div class="absolute inset-0 bg-blue-200 dark:bg-blue-800 rounded-lg opacity-0 group-hover:opacity-30 transition-opacity duration-200"></div>
                <div :class="getToothConditionBackgroundClass(19 - n)" class="absolute inset-0 rounded-lg opacity-60 transition-opacity duration-200"></div>
                <img :src="getToothImagePath(19 - n)" 
                     @error="imageError(19 - n)" 
                     @load="() => toothImageExists[19 - n] = true"
                     :alt="'Tooth ' + (19 - n)" 
                     class="h-24 w-auto mx-auto transition-all duration-200 group-hover:brightness-110 relative z-10" 
                     :class="{'opacity-50': !toothImageExists[19 - n]}"
                     loading="lazy"/>
                <span v-if="!toothImageExists[19 - n]" class="absolute inset-0 flex items-center justify-center text-2xl pointer-events-none z-10">🦷</span>
              </div>
              <div class="mt-1 text-center">
                <span class="block text-xs text-gray-700 dark:text-gray-300 font-semibold transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400" 
                  :class="getToothNumberBoxClass(19 - n)">{{ 19 - n }}</span>
                <div class="mt-0.5 space-y-0.5">
                  <img :src="getIconForTooth(19 - n)" :alt="'Icon ' + (19 - n)" class="h-3 w-3 mx-auto opacity-60 group-hover:opacity-100 transition-opacity duration-200"/>
                  <div v-if="getToothCondition(19 - n)" class="text-xs font-medium px-1 py-0.5 rounded" :class="getConditionDisplayClass(getToothCondition(19 - n))">
                    {{ getConditionDisplayLabel(getToothCondition(19 - n)) }}
                  </div>
                </div>
              </div>
            </button>
          </div>
          
          <!-- Upper Left (Quadrant 2: 21-28) -->
          <div v-for="n in 8" :key="'upper-left-' + (20 + n)" class="relative text-center tooth-item">
              <button
                @click="handleToothClick(20 + n)"
                @mouseenter="handleToothHover(20 + n, $event)"
                @mouseleave="handleToothLeave"
                draggable="true"
                @dragstart="handleChartToothDragStart($event, 20 + n)"
                @dragend="handleDragEnd"
                class="focus:outline-none flex flex-col items-center w-full relative group transition-all duration-200 hover:scale-110 hover:z-10">
              <div class="relative">
                <!-- Critical indicator (red dot) -->
                <span v-if="hasCriticalTreatment(20 + n)" class="absolute -top-1 -left-1 h-3 w-3 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-800 z-20 animate-pulse"></span>
                <div class="absolute inset-0 bg-blue-200 dark:bg-blue-800 rounded-lg opacity-0 group-hover:opacity-30 transition-opacity duration-200"></div>
                <div :class="getToothConditionBackgroundClass(20 + n)" class="absolute inset-0 rounded-lg opacity-60 transition-opacity duration-200"></div>
                <img :src="getToothImagePath(20 + n)" 
                     @error="imageError(20 + n)" 
                     @load="() => toothImageExists[20 + n] = true"
                     :alt="'Tooth ' + (20 + n)" 
                     class="h-24 w-auto mx-auto transition-all duration-200 group-hover:brightness-110 relative z-10" 
                     :class="{'opacity-50': !toothImageExists[20 + n]}"
                     loading="lazy"/>
                <span v-if="!toothImageExists[20 + n]" class="absolute inset-0 flex items-center justify-center text-2xl pointer-events-none z-10">🦷</span>
              </div>
              <div class="mt-1 text-center">
                <span class="block text-xs text-gray-700 dark:text-gray-300 font-semibold transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                  :class="getToothNumberBoxClass(20 + n)">{{ 20 + n }}</span>
                <div class="mt-0.5 space-y-0.5">
                  <img :src="getIconForTooth(20 + n)" :alt="'Icon ' + (20 + n)" class="h-3 w-3 mx-auto opacity-60 group-hover:opacity-100 transition-opacity duration-200"/>
                  <div v-if="getToothCondition(20 + n)" class="text-xs font-medium px-1 py-0.5 rounded" :class="getConditionDisplayClass(getToothCondition(20 + n))">
                    {{ getConditionDisplayLabel(getToothCondition(20 + n)) }}
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Lower Jaw with padding top -->
        <div class="grid grid-cols-16 gap-0 mt-6 pt-4 justify-items-center">
          <!-- Lower Right (Quadrant 4: 41-48) -->
          <div v-for="n in 8" :key="'lower-right-' + (49 - n)" class="relative text-center tooth-item">
              <button
                @click="handleToothClick(49 - n)"
                @mouseenter="handleToothHover(49 - n, $event)"
                @mouseleave="handleToothLeave"
                draggable="true"
                @dragstart="handleChartToothDragStart($event, 49 - n)"
                @dragend="handleDragEnd"
                class="focus:outline-none flex flex-col items-center w-full relative group transition-all duration-200 hover:scale-110 hover:z-10">
              <div class="relative">
                <!-- Critical indicator (red dot) -->
                <span v-if="hasCriticalTreatment(49 - n)" class="absolute -top-1 -left-1 h-3 w-3 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-800 z-20 animate-pulse"></span>
                <div class="absolute inset-0 bg-blue-200 dark:bg-blue-800 rounded-lg opacity-0 group-hover:opacity-30 transition-opacity duration-200"></div>
                <div :class="getToothConditionBackgroundClass(49 - n)" class="absolute inset-0 rounded-lg opacity-60 transition-opacity duration-200"></div>
                <img :src="getToothImagePath(49 - n)" 
                     @error="imageError(49 - n)" 
                     @load="() => toothImageExists[49 - n] = true"
                     :alt="'Tooth ' + (49 - n)" 
                     class="h-24 w-auto mx-auto transition-all duration-200 group-hover:brightness-110 relative z-10" 
                     :class="{'opacity-50': !toothImageExists[49 - n]}"
                     loading="lazy"/>
                <span v-if="!toothImageExists[49 - n]" class="absolute inset-0 flex items-center justify-center text-2xl pointer-events-none z-10">🦷</span>
              </div>
              <div class="mt-1 text-center">
                <span class="block text-xs text-gray-700 dark:text-gray-300 font-semibold transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                  :class="getToothNumberBoxClass(49 - n)">{{ 49 - n }}</span>
                <div class="mt-0.5 space-y-0.5">
                  <img :src="getIconForTooth(49 - n)" :alt="'Icon ' + (49 - n)" class="h-3 w-3 mx-auto opacity-60 group-hover:opacity-100 transition-opacity duration-200"/>
                  <div v-if="getToothCondition(49 - n)" class="text-xs font-medium px-1 py-0.5 rounded" :class="getConditionDisplayClass(getToothCondition(49 - n))">
                    {{ getConditionDisplayLabel(getToothCondition(49 - n)) }}
                  </div>
                </div>
              </div>
            </button>
          </div>
          
          <!-- Lower Left (Quadrant 3: 31-38) -->
          <div v-for="n in 8" :key="'lower-left-' + (30 + n)" class="relative text-center tooth-item">
              <button
                @click="handleToothClick(30 + n)"
                @mouseenter="handleToothHover(30 + n, $event)"
                @mouseleave="handleToothLeave"
                draggable="true"
                @dragstart="handleChartToothDragStart($event, 30 + n)"
                @dragend="handleDragEnd"
                class="focus:outline-none flex flex-col items-center w-full relative group transition-all duration-200 hover:scale-110 hover:z-10">
              <div class="relative">
                <!-- Critical indicator (red dot) -->
                <span v-if="hasCriticalTreatment(30 + n)" class="absolute -top-1 -left-1 h-3 w-3 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-800 z-20 animate-pulse"></span>
                <div class="absolute inset-0 bg-blue-200 dark:bg-blue-800 rounded-lg opacity-0 group-hover:opacity-30 transition-opacity duration-200"></div>
                <div :class="getToothConditionBackgroundClass(30 + n)" class="absolute inset-0 rounded-lg opacity-60 transition-opacity duration-200"></div>
                <img :src="getToothImagePath(30 + n)" 
                     @error="imageError(30 + n)" 
                     @load="() => toothImageExists[30 + n] = true"
                     :alt="'Tooth ' + (30 + n)" 
                     class="h-24 w-auto mx-auto transition-all duration-200 group-hover:brightness-110 relative z-10" 
                     :class="{'opacity-50': !toothImageExists[30 + n]}"
                     loading="lazy"/>
                <span v-if="!toothImageExists[30 + n]" class="absolute inset-0 flex items-center justify-center text-2xl pointer-events-none z-10">🦷</span>
              </div>
              <div class="mt-1 text-center">
                <span class="block text-xs text-gray-700 dark:text-gray-300 font-semibold transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                  :class="getToothNumberBoxClass(30 + n)">{{ 30 + n }}</span>
                <div class="mt-0.5 space-y-0.5">
                  <img :src="getIconForTooth(30 + n)" :alt="'Icon ' + (30 + n)" class="h-3 w-3 mx-auto opacity-60 group-hover:opacity-100 transition-opacity duration-200"/>
                  <div v-if="getToothCondition(30 + n)" class="text-xs font-medium px-1 py-0.5 rounded" :class="getConditionDisplayClass(getToothCondition(30 + n))">
                    {{ getConditionDisplayLabel(getToothCondition(30 + n)) }}
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Children's Teeth Chart -->
      <div v-else-if="activeTab === 'children'" class="children-chart">
        <!-- Quadrant Labels for Children -->
        <div class="absolute top-2 left-2 text-xs text-gray-500 dark:text-gray-400 font-semibold">Q6</div>
        <div class="absolute top-2 right-2 text-xs text-gray-500 dark:text-gray-400 font-semibold">Q5</div>
        <div class="absolute bottom-2 left-2 text-xs text-gray-500 dark:text-gray-400 font-semibold">Q7</div>
        <div class="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400 font-semibold">Q8</div>
        
        <!-- Enhanced Quadrant Dividing Lines -->
        <div class="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent dark:via-purple-500 transform -translate-y-1/2"></div>
        <div class="absolute top-0 bottom-0 left-1/2 w-0.5 bg-gradient-to-b from-transparent via-purple-400 to-transparent dark:via-purple-500 transform -translate-x-1/2"></div>

        <!-- Upper Jaw - Children -->
        <div class="grid grid-cols-10 gap-0 mb-3 justify-items-center">
          <!-- Upper Right (Quadrant 5: 51-55) -->
          <div v-for="n in 5" :key="'child-upper-right-' + (56 - n)" class="relative text-center tooth-item">
              <button
                @click="handleToothClick(56 - n)"
                @mouseenter="handleToothHover(56 - n, $event)"
                @mouseleave="handleToothLeave"
                draggable="true"
                @dragstart="handleChartToothDragStart($event, 56 - n)"
                @dragend="handleDragEnd"
                class="focus:outline-none flex flex-col items-center w-full relative group transition-all duration-200 hover:scale-110 hover:z-10">
              <div class="relative">
                <!-- Critical indicator (red dot) -->
                <span v-if="hasCriticalTreatment(56 - n)" class="absolute -top-1 -left-1 h-3 w-3 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-800 z-20 animate-pulse"></span>
                <div class="absolute inset-0 bg-purple-200 dark:bg-purple-800 rounded-lg opacity-0 group-hover:opacity-30 transition-opacity duration-200"></div>
                <div :class="getToothConditionBackgroundClass(56 - n)" class="absolute inset-0 rounded-lg opacity-60 transition-opacity duration-200"></div>
                <img :src="getChildToothImagePath(56 - n)" 
                     @error="imageError(56 - n)" 
                     @load="() => toothImageExists[56 - n] = true"
                     :alt="'Child Tooth ' + (56 - n)" 
                     class="h-24 w-auto mx-auto transition-all duration-200 group-hover:brightness-110 relative z-10" 
                     :class="{'opacity-50': !toothImageExists[56 - n]}"
                     loading="lazy"/>
                <span v-if="!toothImageExists[56 - n]" class="absolute inset-0 flex items-center justify-center text-2xl pointer-events-none z-10">🦷</span>
              </div>
              <div class="mt-1 text-center">
                <span class="block text-xs text-gray-700 dark:text-gray-300 font-semibold transition-colors duration-200 group-hover:text-purple-600 dark:group-hover:text-purple-400" 
                  :class="getToothNumberBoxClass(56 - n)">{{ 56 - n }}</span>
                <div class="mt-0.5 space-y-0.5">
                  <img :src="getChildToothIcon(56 - n)" :alt="'Icon ' + (56 - n)" class="h-3 w-3 mx-auto opacity-60 group-hover:opacity-100 transition-opacity duration-200"/>
                  <div v-if="getToothCondition(56 - n)" class="text-xs font-medium px-1 py-0.5 rounded" :class="getConditionDisplayClass(getToothCondition(56 - n))">
                    {{ getConditionDisplayLabel(getToothCondition(56 - n)) }}
                  </div>
                </div>
              </div>
            </button>
          </div>
          
          <!-- Upper Left (Quadrant 6: 61-65) -->
          <div v-for="n in 5" :key="'child-upper-left-' + (60 + n)" class="relative text-center tooth-item">
              <button
                @click="handleToothClick(60 + n)"
                @mouseenter="handleToothHover(60 + n, $event)"
                @mouseleave="handleToothLeave"
                draggable="true"
                @dragstart="handleChartToothDragStart($event, 60 + n)"
                @dragend="handleDragEnd"
                class="focus:outline-none flex flex-col items-center w-full relative group transition-all duration-200 hover:scale-110 hover:z-10">
              <div class="relative">
                <!-- Critical indicator (red dot) -->
                <span v-if="hasCriticalTreatment(60 + n)" class="absolute -top-1 -left-1 h-3 w-3 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-800 z-20 animate-pulse"></span>
                <div class="absolute inset-0 bg-purple-200 dark:bg-purple-800 rounded-lg opacity-0 group-hover:opacity-30 transition-opacity duration-200"></div>
                <div :class="getToothConditionBackgroundClass(60 + n)" class="absolute inset-0 rounded-lg opacity-60 transition-opacity duration-200"></div>
                <img :src="getChildToothImagePath(60 + n)" 
                     @error="imageError(60 + n)" 
                     @load="() => toothImageExists[60 + n] = true"
                     :alt="'Child Tooth ' + (60 + n)" 
                     class="h-24 w-auto mx-auto transition-all duration-200 group-hover:brightness-110 relative z-10" 
                     :class="{'opacity-50': !toothImageExists[60 + n]}"
                     loading="lazy"/>
                <span v-if="!toothImageExists[60 + n]" class="absolute inset-0 flex items-center justify-center text-2xl pointer-events-none z-10">🦷</span>
              </div>
              <div class="mt-1 text-center">
                <span class="block text-xs text-gray-700 dark:text-gray-300 font-semibold transition-colors duration-200 group-hover:text-purple-600 dark:group-hover:text-purple-400"
                  :class="getToothNumberBoxClass(60 + n)">{{ 60 + n }}</span>
                <div class="mt-0.5 space-y-0.5">
                  <img :src="getChildToothIcon(60 + n)" :alt="'Icon ' + (60 + n)" class="h-3 w-3 mx-auto opacity-60 group-hover:opacity-100 transition-opacity duration-200"/>
                  <div v-if="getToothCondition(60 + n)" class="text-xs font-medium px-1 py-0.5 rounded" :class="getConditionDisplayClass(getToothCondition(60 + n))">
                    {{ getConditionDisplayLabel(getToothCondition(60 + n)) }}
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Lower Jaw - Children with padding top -->
        <div class="grid grid-cols-10 gap-0 mt-6 pt-4 justify-items-center">
          <!-- Lower Right (Quadrant 8: 81-85) -->
          <div v-for="n in 5" :key="'child-lower-right-' + (86 - n)" class="relative text-center tooth-item">
              <button
                @click="handleToothClick(86 - n)"
                @mouseenter="handleToothHover(86 - n, $event)"
                @mouseleave="handleToothLeave"
                draggable="true"
                @dragstart="handleChartToothDragStart($event, 86 - n)"
                @dragend="handleDragEnd"
                class="focus:outline-none flex flex-col items-center w-full relative group transition-all duration-200 hover:scale-110 hover:z-10">
              <div class="relative">
                <!-- Critical indicator (red dot) -->
                <span v-if="hasCriticalTreatment(86 - n)" class="absolute -top-1 -left-1 h-3 w-3 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-800 z-20 animate-pulse"></span>
                <div class="absolute inset-0 bg-purple-200 dark:bg-purple-800 rounded-lg opacity-0 group-hover:opacity-30 transition-opacity duration-200"></div>
                <div :class="getToothConditionBackgroundClass(86 - n)" class="absolute inset-0 rounded-lg opacity-60 transition-opacity duration-200"></div>
                <img :src="getChildToothImagePath(86 - n)" 
                     @error="imageError(86 - n)" 
                     @load="() => toothImageExists[86 - n] = true"
                     :alt="'Child Tooth ' + (86 - n)" 
                     class="h-24 w-auto mx-auto transition-all duration-200 group-hover:brightness-110 relative z-10" 
                     :class="{'opacity-50': !toothImageExists[86 - n]}"
                     loading="lazy"/>
                <span v-if="!toothImageExists[86 - n]" class="absolute inset-0 flex items-center justify-center text-2xl pointer-events-none z-10">🦷</span>
              </div>
              <div class="mt-1 text-center">
                <span class="block text-xs text-gray-700 dark:text-gray-300 font-semibold transition-colors duration-200 group-hover:text-purple-600 dark:group-hover:text-purple-400"
                  :class="getToothNumberBoxClass(86 - n)">{{ 86 - n }}</span>
                <div class="mt-0.5 space-y-0.5">
                  <img :src="getChildToothIcon(86 - n)" :alt="'Icon ' + (86 - n)" class="h-3 w-3 mx-auto opacity-60 group-hover:opacity-100 transition-opacity duration-200"/>
                  <div v-if="getToothCondition(86 - n)" class="text-xs font-medium px-1 py-0.5 rounded" :class="getConditionDisplayClass(getToothCondition(86 - n))">
                    {{ getConditionDisplayLabel(getToothCondition(86 - n)) }}
                  </div>
                </div>
              </div>
            </button>
          </div>
          
          <!-- Lower Left (Quadrant 7: 71-75) -->
          <div v-for="n in 5" :key="'child-lower-left-' + (70 + n)" class="relative text-center tooth-item">
              <button
                @click="handleToothClick(70 + n)"
                @mouseenter="handleToothHover(70 + n, $event)"
                @mouseleave="handleToothLeave"
                draggable="true"
                @dragstart="handleChartToothDragStart($event, 70 + n)"
                @dragend="handleDragEnd"
                class="focus:outline-none flex flex-col items-center w-full relative group transition-all duration-200 hover:scale-110 hover:z-10">
              <div class="relative">
                <!-- Critical indicator (red dot) -->
                <span v-if="hasCriticalTreatment(70 + n)" class="absolute -top-1 -left-1 h-3 w-3 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-800 z-20 animate-pulse"></span>
                <div class="absolute inset-0 bg-purple-200 dark:bg-purple-800 rounded-lg opacity-0 group-hover:opacity-30 transition-opacity duration-200"></div>
                <div :class="getToothConditionBackgroundClass(70 + n)" class="absolute inset-0 rounded-lg opacity-60 transition-opacity duration-200"></div>
                <img :src="getChildToothImagePath(70 + n)" 
                     @error="imageError(70 + n)" 
                     @load="() => toothImageExists[70 + n] = true"
                     :alt="'Child Tooth ' + (70 + n)" 
                     class="h-24 w-auto mx-auto transition-all duration-200 group-hover:brightness-110 relative z-10" 
                     :class="{'opacity-50': !toothImageExists[70 + n]}"
                     loading="lazy"/>
                <span v-if="!toothImageExists[70 + n]" class="absolute inset-0 flex items-center justify-center text-2xl pointer-events-none z-10">🦷</span>
              </div>
              <div class="mt-1 text-center">
                <span class="block text-xs text-gray-700 dark:text-gray-300 font-semibold transition-colors duration-200 group-hover:text-purple-600 dark:group-hover:text-purple-400"
                  :class="getToothNumberBoxClass(70 + n)">{{ 70 + n }}</span>
                <div class="mt-0.5 space-y-0.5">
                  <img :src="getChildToothIcon(70 + n)" :alt="'Icon ' + (70 + n)" class="h-3 w-3 mx-auto opacity-60 group-hover:opacity-100 transition-opacity duration-200"/>
                  <div v-if="getToothCondition(70 + n)" class="text-xs font-medium px-1 py-0.5 rounded" :class="getConditionDisplayClass(getToothCondition(70 + n))">
                    {{ getConditionDisplayLabel(getToothCondition(70 + n)) }}
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Compact Floating Tooth Treatment Summary - Bottom Right Corner -->
    <Teleport to="body">
        <div v-if="hoveredTooth && showHoverSummary"
             class="fixed bottom-6 right-6 pointer-events-auto"
             style="z-index: 9999;">
        <div class="bg-white/95 dark:bg-gray-900/95 backdrop-blur border border-gray-200/80 dark:border-gray-700/80 rounded-2xl shadow-2xl w-[360px] transition-all duration-200">
          <!-- Compact Header -->
          <div class="p-4 border-b border-gray-200/70 dark:border-gray-700/70 bg-white/60 dark:bg-gray-800/70 rounded-t-2xl relative backdrop-blur-sm">
            <!-- Status badge positioned at top-right -->
            <span v-if="getToothStatus(hoveredTooth)" 
                  :class="getHoverStatusClass(getToothStatus(hoveredTooth))" 
                  class="absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-md">
              {{ getStatusLabel(getToothStatus(hoveredTooth)) }}
            </span>
            
            <div class="flex items-center space-x-2 pr-16">
              <div class="bg-blue-100/60 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 p-2 rounded-xl">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a1.5 1.5 0 011.5 1.5v1a1.5 1.5 0 01-1.5 1.5H9"/>
                </svg>
              </div>
              <div>
                <h4 class="font-medium text-gray-900 dark:text-white text-sm">Tooth {{ hoveredTooth }}</h4>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ getQuadrantName(hoveredTooth) }}</p>
              </div>
            </div>
            
            <!-- Condition display below the header -->
            <div class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">Condition:</span>
                <div class="inline-flex items-center px-2 py-1 rounded text-xs font-medium" :class="getConditionDisplayClass(toothConditions[String(hoveredTooth)]?.condition)">
                  {{ getFormattedCondition(toothConditions[String(hoveredTooth)]?.condition) }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Compact content area -->
          <div class="max-h-80 overflow-y-auto custom-scrollbar">
            <div class="p-4 space-y-3">
            
            <!-- No treatments state -->
            <div v-if="getToothTreatments(hoveredTooth).length === 0" 
                 class="text-center py-3">
              <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                <svg class="w-6 h-6 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <h3 class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">No Treatments</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">No recorded treatments</p>
                <p class="text-xs text-gray-600 dark:text-gray-400 font-medium">Click to add treatment</p>
              </div>
            </div>
            
            <!-- Treatments List -->
            <div v-if="getToothTreatments(hoveredTooth).length > 0" class="space-y-2">
              <div v-for="(treatment, index) in getToothTreatments(hoveredTooth)" 
                   :key="index" 
                   class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600 hover:shadow-sm transition-shadow duration-200">
                
                <!-- Treatment Header -->
                <div class="flex items-center justify-between mb-2">
                  <h6 class="font-medium text-gray-800 dark:text-gray-200 text-sm flex items-center">
                    <div class="w-1.5 h-1.5 rounded-full mr-2" :class="getStatusDotClass(calculateTreatmentStatus(treatment)).replace('absolute -top-1 -right-1 h-3 w-3 rounded-full ring-2 ring-white dark:ring-gray-800 z-10', '')"></div>
                    {{ getTreatmentTitle(treatment.treatment_type, index, treatment) }}
                  </h6>
                  <span :class="getHoverStatusClass(calculateTreatmentStatus(treatment))" 
                        class="px-2 py-0.5 text-xs font-medium rounded border">
                    {{ getStatusLabel(calculateTreatmentStatus(treatment)) }}
                  </span>
                </div>

                <!-- Treatment Notes -->
                <div v-if="treatment.notes" class="bg-gray-100 dark:bg-gray-600/30 rounded p-2 mb-2 border border-gray-200 dark:border-gray-600">
                  <div class="flex items-start">
                    <svg class="w-3 h-3 text-gray-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
                    </svg>
                    <p class="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">{{ treatment.notes }}</p>
                  </div>
                </div>

                <!-- Treatment Steps -->
                <div v-if="treatment.steps && treatment.steps.length > 0" class="mb-2">
                  <div class="bg-white dark:bg-gray-800 rounded p-2 border border-gray-200 dark:border-gray-600">
                    <div class="space-y-2">
                      <div v-for="(step, stepIndex) in treatment.steps" :key="stepIndex" 
                           class="flex items-start text-xs bg-gray-50 dark:bg-gray-700/30 rounded p-2"
                           :class="{'border-l-2 border-red-400 bg-red-50 dark:bg-red-900/20': step.is_critical}">
                        <div class="flex-shrink-0 mr-2 mt-1">
                          <span class="w-2 h-2 rounded-full inline-block" :class="getStepDotClass(step.status)"></span>
                        </div>
                        <div class="flex-grow">
                          <div class="flex items-center justify-between mb-1">
                            <p class="text-gray-800 dark:text-gray-200 leading-snug font-medium">
                              {{ step.description || `Step ${stepIndex + 1}` }}
                            </p>
                            <!-- Critical indicator in popup -->
                            <span v-if="step.is_critical" class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 ml-2">
                              <span class="w-1 h-1 bg-red-500 rounded-full mr-1"></span>
                              Critical
                            </span>
                          </div>
                          <div class="flex items-center justify-between">
                            <span class="text-xs px-1.5 py-0.5 rounded font-medium" :class="getHoverStatusClass(step.status)">
                              {{ getStepStatusLabel(step.status) }}
                            </span>
                            <!-- Remaining days for critical steps -->
                            <span v-if="step.is_critical && getRemainingDaysForPopup(step)" class="text-xs font-semibold text-red-600 dark:text-red-400">
                              {{ getRemainingDaysForPopup(step) }}d left
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Other treatment details -->
                <div v-if="treatment.other_treatment_text" class="mb-2">
                  <div class="bg-amber-50 dark:bg-amber-900/20 rounded p-2 border-l-2 border-amber-400">
                    <div class="flex items-center mb-1">
                      <svg class="w-3 h-3 text-amber-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1"/>
                      </svg>
                      <span class="text-xs font-medium text-amber-700 dark:text-amber-400">Details</span>
                    </div>
                    <p class="text-xs text-amber-800 dark:text-amber-300">{{ treatment.other_treatment_text }}</p>
                  </div>
                </div>

                <!-- Financial Summary -->
                <div class="bg-gray-100 dark:bg-gray-600/30 rounded p-2 border border-gray-200 dark:border-gray-600 mt-2">
                  <div class="flex items-center mb-1">
                    <svg class="w-3 h-3 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                    </svg>
                    <h6 class="text-xs font-medium text-gray-800 dark:text-gray-300">Payment</h6>
                  </div>
                  <div class="space-y-1 text-xs">
                    <div class="flex justify-between items-center">
                      <p class="text-gray-700 dark:text-gray-300">Cost:</p>
                      <p class="font-medium text-gray-800 dark:text-gray-100">{{ formatCurrency(treatment.cost, treatment.currency) }}</p>
                    </div>
                    <div class="flex justify-between items-center">
                      <p class="text-gray-700 dark:text-gray-300">Paid:</p>
                      <p class="font-medium text-green-600 dark:text-green-400">{{ formatCurrency(getTotalPaidForTreatment(treatment), treatment.currency) }}</p>
                    </div>
                    <div class="flex justify-between items-center">
                      <p class="text-gray-700 dark:text-gray-300">Due:</p>
                      <p class="font-medium" :class="{'text-red-600 dark:text-red-400': getBalanceForTreatment(treatment) > 0, 'text-green-600 dark:text-green-400': getBalanceForTreatment(treatment) <= 0}">
                        {{ formatCurrency(getBalanceForTreatment(treatment), treatment.currency) }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- X-Ray info -->
                <div v-if="treatment.xray_taken" class="mt-2 bg-purple-50 dark:bg-purple-900/20 rounded p-2 border border-purple-200 dark:border-purple-600">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <svg class="w-3 h-3 text-purple-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      <span class="text-xs font-medium text-purple-700 dark:text-purple-300">X-Ray Taken</span>
                    </div>
                    <a v-if="treatment.xray_image_url" :href="treatment.xray_image_url" target="_blank" 
                       class="text-xs text-purple-600 hover:text-purple-800 dark:text-purple-400 underline">
                      View
                    </a>
                  </div>
                </div>
              </div>
            </div>
              
            <!-- Action hint -->
            <div class="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
              <div class="bg-gray-50 dark:bg-gray-700/30 rounded p-2 border border-gray-200 dark:border-gray-600">
                <div class="flex items-center justify-center">
                  <svg class="w-4 h-4 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p class="text-xs text-gray-700 dark:text-gray-300 text-center font-medium">
                    Click tooth for detailed management
                  </p>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </Teleport>

  </div>


      <FloatingAIVoice />

      <!-- Floating Tooth Order Icon -->
      <div
        class="fixed bottom-8 left-8 z-40 w-16 h-16 bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-gray-700/70 shadow-2xl cursor-pointer hover:shadow-blue-400/30 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center group rounded-2xl"
        @click="openToothOrderPanel"
        v-if="!showToothOrderPanel"
        style="user-select: none;"
      >
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 via-indigo-500 to-purple-500 flex items-center justify-center shadow-inner">
          <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 2c2.5 0 4.5 2 4.5 4.5S14.5 11 12 11 7.5 9 7.5 6.5 9.5 2 12 2zm0 0v20" />
          </svg>
        </div>
        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-slate-900/95 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-lg border border-white/10">
          Manage Tooth Order
        </div>
      </div>

      <!-- Floating Tooth Order Panel -->
      <transition name="fade-slide">
        <div
          v-if="showToothOrderPanel"
          class="fixed bottom-6 left-6 w-[380px] max-h-[80vh] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(15,23,42,0.35)] rounded-[28px] border border-slate-200/80 dark:border-gray-700/70 z-50 flex flex-col overflow-hidden"
        >
          <div class="px-6 py-5 border-b border-slate-200/80 dark:border-gray-700/70 bg-white/70 dark:bg-gray-900/60 backdrop-blur">
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-400 via-indigo-500 to-purple-500 flex items-center justify-center shadow-inner">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 2c2.5 0 4.5 2 4.5 4.5S14.5 11 12 11 7.5 9 7.5 6.5 9.5 2 12 2zm0 0v20" />
                  </svg>
                </div>
                <div>
                  <p class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 font-semibold">Planner</p>
                  <h2 class="text-lg font-bold text-slate-900 dark:text-white leading-tight">Tooth Treatment Order</h2>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Arrange procedures by priority to guide your workflow.</p>
                </div>
              </div>
              <button @click="closeToothOrderPanel" class="shrink-0 text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white transition-colors">
                <span class="sr-only">Close</span>
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div class="px-5 py-4 flex-1 overflow-y-auto space-y-4">
            <div v-if="isLoadingToothOrder" class="text-center py-12 text-slate-500 dark:text-slate-400">Loading...</div>

            <template v-else>
              <div v-if="toothOrderError" class="bg-red-100 text-red-700 rounded-lg p-3 text-sm">{{ toothOrderError }}</div>

              <div
                class="rounded-2xl border border-dashed border-slate-300/70 dark:border-slate-600/70 bg-slate-50/70 dark:bg-slate-800/40 p-3"
                :class="{'ring-2 ring-indigo-300': dragOverIndex === 'list'}"
                @dragover.prevent="handleListDragOver"
                @dragleave="handleListDragLeave"
                @drop="handleListDrop"
              >
                <template v-if="toothOrder.length === 0">
                  <div class="text-center text-gray-500 dark:text-gray-400 py-10 px-2 text-sm">
                    Drop teeth here or use the chart to seed the order from pending treatments automatically.
                  </div>
                </template>
                <template v-else>
                  <ul class="space-y-3">
                    <li
                      v-for="(tooth, idx) in toothOrder"
                      :key="tooth"
                      class="flex items-center bg-white/90 dark:bg-gray-900/70 rounded-2xl shadow-sm p-3 border border-slate-200/80 dark:border-gray-700/70 cursor-grab select-none transition-all duration-150"
                      :class="[
                        recentAddedTooth === String(tooth) ? 'ring-2 ring-green-400 animate-pulse' : '',
                        dragOverIndex === idx ? 'ring-2 ring-indigo-300 shadow-lg' : ''
                      ]"
                      draggable="true"
                      @dragstart="handleDragStart($event, idx)"
                      @dragover="handleDragOver($event, idx)"
                      @dragleave="handleDragLeave($event, idx)"
                      @drop="handleDrop($event, idx)"
                      @dragend="handleDragEnd"
                      @mouseover="handleToothHover(tooth, $event, true)"
                      @mouseout="handleToothLeave"
                    >
                      <div class="flex items-center gap-3 flex-1 min-w-0">
                        <div class="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 dark:bg-gray-800/80 border border-slate-200/80 dark:border-gray-700/70">
                          <img
                            :src="getToothImagePath(tooth)"
                            alt="tooth"
                            class="w-9 h-9"
                            style="object-fit:contain;"
                            draggable="false"
                          />
                        </div>
                        <div class="flex flex-col min-w-0">
                          <span class="text-[11px] uppercase tracking-wide font-semibold text-slate-400">Position {{ idx + 1 }}</span>
                          <span class="font-semibold text-slate-800 dark:text-slate-100 truncate text-base">Tooth {{ tooth }}</span>
                        </div>
                      </div>
                      <div class="flex items-center gap-1.5 ml-3">
                        <button @click="moveToothUp(idx)" :disabled="idx === 0" class="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30" title="Move up"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/></svg></button>
                        <button @click="moveToothDown(idx)" :disabled="idx === toothOrder.length-1" class="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30" title="Move down"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg></button>
                        <button @click="removeTooth(idx)" class="p-2 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50/80 dark:hover:bg-red-500/10" title="Remove"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button>
                      </div>
                    </li>
                  </ul>
                </template>
              </div>

              <div class="flex flex-wrap gap-2 items-center">
                <input v-model="newToothNumber" placeholder="Add tooth #" class="border border-slate-300/80 dark:border-gray-700 bg-white/90 dark:bg-gray-900/70 rounded-lg px-3 py-2 w-28 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                <button @click="addTooth" class="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-3 py-2 rounded-lg text-sm shadow-sm">Add</button>
                <button @click="saveToothOrder" :disabled="isSavingToothOrder" class="ml-auto bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm shadow-sm">
                  <svg v-if="isSavingToothOrder" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-opacity=".3"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
                  <span>Save Order</span>
                </button>
              </div>
            </template>
          </div>
        </div>
      </transition>

</template>

<script setup>
 
import { computed, reactive, ref } from 'vue';

const props = defineProps({
  patientId: {
    type: [String, Number],
    required: true
  },
  records: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['add-record-for-tooth', 'tooth-selected']);

const activeTab = ref('adult');
const toothImageExists = reactive({});
const hoveredTooth = ref(null);
const showHoverSummary = ref(false);
let hoverTimeout = null;

// Initialize all tooth image states to true, will be set to false on error
const initializeImageStates = () => {
  const toothNumbers = [
    ...Array.from({ length: 8 }, (_, i) => 11 + i), // 11-18 (Adult)
    ...Array.from({ length: 8 }, (_, i) => 21 + i), // 21-28 (Adult)
    ...Array.from({ length: 8 }, (_, i) => 31 + i), // 31-38 (Adult)
    ...Array.from({ length: 8 }, (_, i) => 41 + i), // 41-48 (Adult)
    ...Array.from({ length: 5 }, (_, i) => 51 + i), // 51-55 (Children)
    ...Array.from({ length: 5 }, (_, i) => 61 + i), // 61-65 (Children)
    ...Array.from({ length: 5 }, (_, i) => 71 + i), // 71-75 (Children)
    ...Array.from({ length: 5 }, (_, i) => 81 + i), // 81-85 (Children)
  ];
  toothNumbers.forEach(num => {
    toothImageExists[num] = true;
  });
};
initializeImageStates();

// Hover functionality
const handleToothHover = (toothNumber, event, immediate = false) => {
  clearTimeout(hoverTimeout);
  hoveredTooth.value = String(toothNumber);
  if (immediate) {
    showHoverSummary.value = true;
    return;
  }
  hoverTimeout = setTimeout(() => {
    showHoverSummary.value = true;
  }, 300); // Small delay to prevent flashing
};

const handleToothLeave = () => {
  clearTimeout(hoverTimeout);
  showHoverSummary.value = false;
  hoverTimeout = setTimeout(() => {
    hoveredTooth.value = null;
  }, 200); // Small delay to allow for smooth transitions
};

const getToothImagePath = (toothNumber) => {
  return `/img/teeth/${toothNumber}.png`;
};

const imageError = (toothNumber) => {
  console.log(`Image failed to load for tooth ${toothNumber}: ${getToothImagePath(toothNumber)}`);
  toothImageExists[toothNumber] = false;
};

const getIconForTooth = (toothNumber) => {
  const lastDigit = String(toothNumber).slice(-1);
  if (['6', '7', '8'].includes(lastDigit)) {
    return '/img/teeth/square.jpeg'; // Molars
  } else {
    return '/img/teeth/cross.png'; // Incisors, Canines, Premolars
  }
};

// Helper functions for children's teeth
const getChildToothImagePath = (toothNumber) => {
  return `/img/teeth/${toothNumber}.png`;
};

const getChildToothIcon = (toothNumber) => {
  const lastDigit = String(toothNumber).slice(-1);
  if (['4', '5'].includes(lastDigit)) {
    return '/img/teeth/square.jpeg'; // Primary molars
  } else {
    return '/img/teeth/cross.png'; // Primary incisors and canines
  }
};

const toothConditions = computed(() => {
  const conditions = {};
  props.records.forEach(record => {
    if (record.tooth_number) {
      // Use the tooth_number from the record level, not treatment level
      const toothNumStr = String(record.tooth_number);
      conditions[toothNumStr] = {
        status: record.status,
        condition: record.condition,
      };
    }
  });
  return conditions;
});
const getToothStatus = (toothNumber) => {
  return toothConditions.value[String(toothNumber)]?.status;
};

const getStatusDotClass = (status) => {
  const baseClass = 'absolute -top-1 -right-1 h-3 w-3 rounded-full ring-2 ring-white dark:ring-gray-800 z-10';
  switch (status?.toLowerCase()) {
    case 'initial':
      return `${baseClass} bg-sky-400`;
    case 'diagnosis_planned':
      return `${baseClass} bg-purple-400`;
    case 'intreatment':
      return `${baseClass} bg-amber-400`;
    case 'completed':
      return `${baseClass} bg-emerald-400`;
    default:
      return `${baseClass} bg-slate-400`;
  }
};

const getToothNumberBoxClass = (toothNumber) => {
  const status = getToothStatus(toothNumber);
  if (!status) return '';
  
  // Base class for all status boxes
  const baseClass = 'px-1.5 py-0.5 rounded border';
  
  switch (status?.toLowerCase()) {
    case 'initial':
      return `${baseClass} border-sky-400 bg-sky-50 dark:bg-sky-900/30`;
    case 'diagnosis_planned':
      return `${baseClass} border-purple-400 bg-purple-50 dark:bg-purple-900/30`;
    case 'intreatment':
      return `${baseClass} border-amber-400 bg-amber-50 dark:bg-amber-900/30`;
    case 'completed':
      return `${baseClass} border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30`;
    default:
      return '';
  }
};

// Helper functions for hover tooltip
const getToothTreatments = (toothNumber) => {
  const toothRecords = props.records.filter(record => 
    String(record.tooth_number) === String(toothNumber)
  );
  
  const treatments = [];
  toothRecords.forEach(record => {
    if (record.treatments && Array.isArray(record.treatments)) {
      treatments.push(...record.treatments);
    }
  });
  
  return treatments;
};

// Check if tooth has any critical steps
const hasCriticalTreatment = (toothNumber) => {
  const treatments = getToothTreatments(toothNumber);
  return treatments.some(treatment => 
    treatment.steps && treatment.steps.some(step => step.is_critical)
  );
};

// Get all critical steps for a tooth
const getCriticalSteps = (toothNumber) => {
  const treatments = getToothTreatments(toothNumber);
  const criticalSteps = [];
  treatments.forEach(treatment => {
    if (treatment.steps) {
      treatment.steps.forEach(step => {
        if (step.is_critical) {
          criticalSteps.push({
            ...step,
            treatmentType: treatment.treatment_type,
            treatmentTitle: getTreatmentTitle(treatment.treatment_type, 0, treatment)
          });
        }
      });
    }
  });
  return criticalSteps;
};

const getStatusLabel = (statusValue) => {
  const statusOptions = [
    { value: 'initial', label: 'Initial' },
    { value: 'diagnosis_planned', label: 'Diagnosis Planned' },
    { value: 'intreatment', label: 'In Treatment' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
    { value: 'cancelled', label: 'Cancelled' }
  ];
  
  const option = statusOptions.find(opt => opt.value === statusValue);
  return option ? option.label : 'Unknown';
};





const getHoverStatusClass = (statusValue) => {
  switch (statusValue?.toLowerCase()) {
    case 'initial':
      return 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300';
    case 'diagnosis_planned':
      return 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
    case 'intreatment':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
    case 'completed':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
    case 'pending':
      return 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300';
    case 'in_progress':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
    case 'done':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
    case 'skipped':
      return 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300';
    default:
      return 'bg-slate-50 text-slate-700 dark:bg-slate-700 dark:text-slate-200';
  }
};

const getTreatmentTitle = (type, index, treatment) => {
  if (type === 'other_treatment' && treatment && treatment.other_treatment_text) {
    return treatment.other_treatment_text.replace(/\b\w/g, l => l.toUpperCase());
  }
  return type ? type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : `Treatment ${index + 1}`;
};

const formatCurrency = (amount, currency) => {
  if (amount === null || amount === undefined) amount = 0;
  
  let currencySymbol = '';
  let format = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
  
  switch(currency) {
    case 'INR':
      currencySymbol = '₹';
      break;
    case 'EUR':
      currencySymbol = '€';
      break;
    case 'GBP':
      currencySymbol = '£';
      break;
    default:
      currencySymbol = '$';
  }
  
  return `${currencySymbol}${Number(amount).toLocaleString('en-US', format)}`;
};

const getQuadrantName = (toothNumber) => {
  const tooth = Number(toothNumber);
  // Adult teeth
  if (tooth >= 11 && tooth <= 18) return 'Upper Right';
  if (tooth >= 21 && tooth <= 28) return 'Upper Left';
  if (tooth >= 31 && tooth <= 38) return 'Lower Left';
  if (tooth >= 41 && tooth <= 48) return 'Lower Right';
  // Children's teeth
  if (tooth >= 51 && tooth <= 55) return 'Upper Right (Primary)';
  if (tooth >= 61 && tooth <= 65) return 'Upper Left (Primary)';
  if (tooth >= 71 && tooth <= 75) return 'Lower Left (Primary)';
  if (tooth >= 81 && tooth <= 85) return 'Lower Right (Primary)';
  return 'Unknown';
};

const getToothType = (toothNumber) => {
  const tooth = Number(toothNumber);
  const lastDigit = String(toothNumber).slice(-1);
  
  // Check if it's a children's tooth
  if (tooth >= 51 && tooth <= 85) {
    const childToothTypes = {
      '1': 'Central Incisor (Primary)',
      '2': 'Lateral Incisor (Primary)', 
      '3': 'Canine (Primary)',
      '4': 'First Molar (Primary)',
      '5': 'Second Molar (Primary)'
    };
    return childToothTypes[lastDigit] || 'Unknown Primary';
  }
  
  // Adult teeth
  const toothTypes = {
    '1': 'Central Incisor',
    '2': 'Lateral Incisor', 
    '3': 'Canine',
    '4': 'First Premolar',
    '5': 'Second Premolar',
    '6': 'First Molar',
    '7': 'Second Molar',
    '8': 'Third Molar (Wisdom)'
  };
  return toothTypes[lastDigit] || 'Unknown';
};

const getTreatmentBorderClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'initial':
      return 'border-blue-400';
    case 'diagnosis_planned':
      return 'border-indigo-400';
    case 'intreatment':
      return 'border-yellow-400';
    case 'completed':
      return 'border-emerald-400';
    default:
      return 'border-gray-300';
  }
};

// Additional helper functions for comprehensive tooltip
const calculateTreatmentStatus = (treatment) => {
  // If treatment already has a status, use it
  if (treatment.status) {
    return treatment.status;
  }
  
  // Calculate status based on payments and steps
  const totalCost = Number(treatment.cost) || 0;
  const totalPaid = getTotalPaidForTreatment(treatment);
  
  if (treatment.steps && treatment.steps.length > 0) {
    // Check if all steps are completed
    const allStepsDone = treatment.steps.every(step => step.status === 'done');
    const anyStepInProgress = treatment.steps.some(step => step.status === 'in_progress');
    
    if (allStepsDone) {
      return 'completed';
    } else if (anyStepInProgress) {
      return 'intreatment';
    } else {
      return 'diagnosis_planned';
    }
  } else {
    // No steps, determine by payment
    if (totalPaid >= totalCost && totalCost > 0) {
      return 'completed';
    } else if (totalPaid > 0) {
      return 'intreatment';
    } else {
      return 'initial';
    }
  }
};

const getTreatmentCondition = (treatment) => {
  // Check if condition is directly available on treatment
  if (treatment.condition) {
    return treatment.condition;
  }
  
  // Determine condition based on treatment type
  if (treatment.treatment_type) {
    switch (treatment.treatment_type.toLowerCase()) {
      case 'extraction':
        return 'Extraction Required';
      case 'filling':
        return 'Cavity';
      case 'root_canal':
        return 'Pulp Infection';
      case 'crown':
        return 'Tooth Damage';
      case 'cleaning':
        return 'Plaque/Tartar';
      case 'other_treatment':
        return treatment.other_treatment_text ? treatment.other_treatment_text : 'Other Treatment';
      default:
        return treatment.other_treatment_text ? treatment.other_treatment_text : 'Not Specified';
    }
  }
  
  return 'Not Specified';
};

const getStepStatusLabel = (statusValue) => {
  const stepStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
    { value: 'skipped', label: 'Skipped' },
  ];
  
  const option = stepStatusOptions.find(opt => opt.value === statusValue);
  return option ? option.label : 'Unknown';
};

const getStepDotClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'bg-sky-400';
    case 'in_progress':
      return 'bg-amber-400';
    case 'done':
      return 'bg-emerald-400';
    case 'skipped':
      return 'bg-rose-400';
    default:
      return 'bg-slate-400';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    // Handle case where date might be an object with _custom format
    if (typeof dateString === 'object' && dateString._custom && dateString._custom.value) {
      dateString = dateString._custom.value;
    }
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
  } catch (e) {
    return String(dateString); // Return original if formatting fails
  }
};

const getTotalPaidForTreatment = (treatment) => {
  if (!treatment || !treatment.payments) return 0;
  return treatment.payments.reduce((sum, payment) => {
    // Handle amount that might be in payment.amount
    let amount = payment.amount;
    return sum + (Number(amount) || 0);
  }, 0);
};

const getBalanceForTreatment = (treatment) => {
  const totalCost = Number(treatment.cost) || 0;
  const totalPaid = getTotalPaidForTreatment(treatment);
  return totalCost - totalPaid;
};

// Calculate remaining days for critical steps (for popup)
const getRemainingDaysForPopup = (step) => {
  if (!step.is_critical || !step.days_to_complete) return null;
  
  // Get the date when the step was created/marked as critical
  const createdDate = step.created_date || step.step_date;
  if (!createdDate) return step.days_to_complete;
  
  try {
    const startDate = new Date(createdDate);
    const today = new Date();
    const daysPassed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    const remainingDays = step.days_to_complete - daysPassed;
    
    return Math.max(0, remainingDays); // Don't show negative days
  } catch (e) {
    return step.days_to_complete; // Fallback to original days
  }
};

const handleToothClick = async (toothNumber) => {
  console.log('Tooth clicked:', toothNumber);
  emit('add-record-for-tooth', String(toothNumber));
  emit('tooth-selected', String(toothNumber)); // legacy

  // Add to tooth order if not already present
  const t = String(toothNumber);
  if (!toothOrder.value.includes(t)) {
    toothOrder.value.push(t);
    // Open panel and save automatically
    showToothOrderPanel.value = true;
    try {
      flashRecentlyAdded(t);
      await saveToothOrder();
    } catch (e) {
      console.error('Error saving tooth order after click', e);
    }
  } else {
    // If already present, just open panel and highlight (set hovered)
    showToothOrderPanel.value = true;
    hoveredTooth.value = t;
    showHoverSummary.value = true;
    setTimeout(() => { showHoverSummary.value = false; hoveredTooth.value = null; }, 2000);
  }
};

const getFormattedCondition = (conditionValue) => {
  if (!conditionValue) return 'No condition recorded';
  
  // List of common conditions with their display labels
  const conditionLabels = {
    'Healthy': 'Healthy',
    'Decayed': 'Decayed',
    'Filled': 'Filled',
    'Missing': 'Missing',
    'Cracked': 'Cracked',
    'Wisdom': 'Wisdom Tooth',
    'Impacted': 'Impacted',
    'Fully Decayed': 'Fully Decayed',
    'Root Canal Done': 'Root Canal Done',
    'Removed': 'Removed',
    'Stained': 'Stained / Discolored',
    'Worn': 'Worn (Attrition)',
    'Sensitivity': 'Tooth Sensitivity',
    'Gingivitis': 'Gingivitis',
    'Periodontitis': 'Periodontitis',
    'Abscess': 'Tooth Abscess',
    'other': 'Other Condition'
  };
  
  return conditionLabels[conditionValue] || conditionValue;
};

const getToothCondition = (toothNumber) => {
  return toothConditions.value[String(toothNumber)]?.condition;
};

const getConditionDisplayLabel = (condition) => {
  if (!condition) return '';
  
  // Truncate long condition names for display
  const label = getFormattedCondition(condition);
  return label.length > 8 ? label.substring(0, 8) + '...' : label;
};

const getConditionDisplayClass = (condition) => {
  if (!condition) return '';
  
  const conditionColors = {
    'Healthy': 'bg-emerald-400 text-white',
    'Decayed': 'bg-rose-400 text-white',
    'Filled': 'bg-sky-400 text-white',
    'Missing': 'bg-slate-400 text-white',
    'Cracked': 'bg-orange-400 text-white',
    'Wisdom': 'bg-violet-400 text-white',
    'Impacted': 'bg-amber-500 text-white',
    'Fully Decayed': 'bg-rose-600 text-white',
    'Root Canal Done': 'bg-violet-600 text-white',
    'Removed': 'bg-slate-600 text-white',
    'Stained': 'bg-yellow-400 text-white',
    'Worn': 'bg-orange-300 text-white',
    'Abrasion': 'bg-orange-500 text-white',
    'Erosion': 'bg-rose-300 text-white',
    'Chipped': 'bg-amber-400 text-white',
    'Fractured Cusp': 'bg-orange-600 text-white',
    'Hypersensitive': 'bg-pink-400 text-white',
    'Periapical Abscess': 'bg-rose-700 text-white',
    'Gingivitis': 'bg-pink-300 text-white',
    'Periodontitis': 'bg-rose-500 text-white',
    'Pericoronitis': 'bg-pink-500 text-white',
    'Supernumerary': 'bg-indigo-300 text-white',
    'Unerupted Primary': 'bg-slate-300 text-white',
    'Retained Primary': 'bg-slate-400 text-white',
    'Malocclusion': 'bg-indigo-500 text-white',
    'Enamel Hypoplasia': 'bg-yellow-400 text-white'
  };
  
  return conditionColors[condition] || 'bg-slate-500 text-white';
};

const getToothConditionBackgroundClass = (toothNumber) => {
  const condition = getToothCondition(toothNumber);
  if (!condition) return '';
  
  const conditionBackgrounds = {
    'Healthy': 'bg-emerald-100 dark:bg-emerald-800',
    'Decayed': 'bg-rose-100 dark:bg-rose-800',
    'Filled': 'bg-sky-100 dark:bg-sky-800',
    'Missing': 'bg-slate-200 dark:bg-slate-600',
    'Cracked': 'bg-orange-100 dark:bg-orange-800',
    'Wisdom': 'bg-violet-100 dark:bg-violet-800',
    'Impacted': 'bg-amber-100 dark:bg-amber-800',
    'Fully Decayed': 'bg-rose-200 dark:bg-rose-900',
    'Root Canal Done': 'bg-violet-200 dark:bg-violet-900',
    'Removed': 'bg-slate-300 dark:bg-slate-700',
    'Stained': 'bg-yellow-100 dark:bg-yellow-800',
    'Worn': 'bg-orange-50 dark:bg-orange-900',
    'Abrasion': 'bg-orange-100 dark:bg-orange-800',
    'Erosion': 'bg-rose-50 dark:bg-rose-900',
    'Chipped': 'bg-amber-50 dark:bg-amber-900',
    'Fractured Cusp': 'bg-orange-200 dark:bg-orange-900',
    'Hypersensitive': 'bg-pink-100 dark:bg-pink-800',
    'Periapical Abscess': 'bg-rose-300 dark:bg-rose-900',
    'Gingivitis': 'bg-pink-50 dark:bg-pink-900',
    'Periodontitis': 'bg-rose-100 dark:bg-rose-800',
    'Pericoronitis': 'bg-pink-100 dark:bg-pink-800',
    'Supernumerary': 'bg-indigo-50 dark:bg-indigo-900',
    'Unerupted Primary': 'bg-slate-100 dark:bg-slate-700',
    'Retained Primary': 'bg-slate-200 dark:bg-slate-600',
    'Malocclusion': 'bg-indigo-100 dark:bg-indigo-800',
    'Enamel Hypoplasia': 'bg-yellow-50 dark:bg-yellow-900'
  };
  
  return conditionBackgrounds[condition] || 'bg-slate-200 dark:bg-slate-800';
};

// --- Floating Tooth Order State ---

import { onMounted, watch } from 'vue';
import { useCookie } from '#imports';
import { navigateTo } from '#app';

const showToothOrderPanel = ref(false);
const toothOrder = ref([]); // Array of tooth numbers (strings)
const isLoadingToothOrder = ref(false);
const isSavingToothOrder = ref(false);
const toothOrderError = ref('');
const newToothNumber = ref('');
const draggedToothIndex = ref(null);
const draggedToothNumber = ref(null);
const dragOverIndex = ref(null);
const isDraggingFromChart = ref(false);

const API_BASE_URL = useRuntimeConfig().public.API_BASE_URL;

const getAuthToken = () => {
  const token = useCookie('dental_access_token');
  return token.value;
};

const makeApiCall = async (method, endpoint, data = null) => {
  const token = getAuthToken();
  if (!token) {
    await navigateTo('/login');
    return null;
  }
  try {
    const config = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    if (data) {
      config.body = JSON.stringify(data);
    }
    // Use $fetch for consistency
    const response = await $fetch(`${API_BASE_URL}${endpoint}`, config);
    return response;
  } catch (err) {
    const status = err?.statusCode || err?.response?.status || err?.status || 0;
    const data = err?.data || { error: err?.message || 'Request failed' };
    console.error(`API Error (${method} ${endpoint}) [${status}]:`, data);
    if (status === 401) {
      await navigateTo('/login');
    }
    throw { status, data };
  }
};

// --- Helpers to seed order from treatment summary ---
const PENDING_TREATMENT_STATUSES = ['pending', 'initial', 'diagnosis_planned', 'intreatment', 'in_progress'];

const getPendingTeethFromRecords = () => {
  const pendingTeeth = [];
  const seen = new Set();

  props.records.forEach(record => {
    if (!record || !record.tooth_number || !Array.isArray(record.treatments)) {
      return;
    }

    const tooth = String(record.tooth_number);
    if (seen.has(tooth)) {
      return;
    }

    const hasPendingTreatment = record.treatments.some(treatment =>
      PENDING_TREATMENT_STATUSES.includes((treatment?.status || '').toLowerCase())
    );

    if (hasPendingTreatment) {
      seen.add(tooth);
      pendingTeeth.push(tooth);
    }
  });

  pendingTeeth.sort((a, b) => Number(a) - Number(b));
  return pendingTeeth;
};

const initializeToothOrderFromPending = (shouldFlash = false) => {
  if (toothOrder.value.length > 0) return;

  const pendingTeeth = getPendingTeethFromRecords();
  if (pendingTeeth.length === 0) return;

  toothOrder.value = [...pendingTeeth];

  if (shouldFlash && pendingTeeth.length > 0) {
    flashRecentlyAdded(pendingTeeth[0]);
  }
};

// --- API Methods ---

const fetchToothOrder = async () => {
  if (!props.patientId) return;
  isLoadingToothOrder.value = true;
  toothOrderError.value = '';
  try {
    console.debug('[ToothOrder] Fetching for patient', props.patientId);
    const res = await makeApiCall('GET', `/patients/${props.patientId}/tooth-order`);
    console.debug('[ToothOrder] Fetch response:', res);
    if (res && Array.isArray(res.tooth_order) && res.tooth_order.length > 0) {
      toothOrder.value = res.tooth_order.map(String);
    } else {
      toothOrder.value = [];
      initializeToothOrderFromPending();
    }
  } catch (e) {
    toothOrderError.value = 'Failed to fetch tooth order.';
    toothOrder.value = [];
    console.error('[ToothOrder] Fetch error:', e);
    initializeToothOrderFromPending();
  } finally {
    isLoadingToothOrder.value = false;
  }
};

const saveToothOrder = async () => {
  if (!props.patientId) return;
  isSavingToothOrder.value = true;
  toothOrderError.value = '';
  try {
    console.debug('[ToothOrder] Saving order for patient', props.patientId, toothOrder.value);
    const res = await makeApiCall('POST', `/patients/${props.patientId}/tooth-order`, { tooth_order: [...toothOrder.value] });
    console.debug('[ToothOrder] Save response:', res);
  } catch (e) {
    toothOrderError.value = 'Failed to save tooth order.';
    console.error('[ToothOrder] Save error:', e);
  } finally {
    isSavingToothOrder.value = false;
  }
};

// --- Floating Icon & Panel ---
const openToothOrderPanel = () => {
  showToothOrderPanel.value = true;
  fetchToothOrder();
};
const closeToothOrderPanel = () => {
  showToothOrderPanel.value = false;
  resetDragState();
};

// --- Auto-populate from pending treatments if no order ---
watch(showToothOrderPanel, (val) => {
  if (val) {
    initializeToothOrderFromPending(true);
  } else {
    resetDragState();
  }
});

watch(() => props.records, () => {
  if (toothOrder.value.length === 0) {
    initializeToothOrderFromPending();
  }
}, { deep: true });

onMounted(() => {
  fetchToothOrder();
});

// --- Tooth Order List Actions ---
const areOrdersEqual = (a, b) => {
  if (a.length !== b.length) return false;
  return a.every((val, idx) => val === b[idx]);
};

const commitOrderChange = async (nextOrder, flashTarget = null) => {
  const sanitizedNext = nextOrder.map(tooth => String(tooth));
  const previous = [...toothOrder.value];
  if (areOrdersEqual(previous, sanitizedNext)) {
    toothOrder.value = previous;
    return false;
  }

  toothOrder.value = sanitizedNext;
  try {
    await saveToothOrder();
    if (flashTarget) {
      flashRecentlyAdded(flashTarget);
    }
    return true;
  } catch (e) {
    toothOrder.value = previous;
    throw e;
  }
};

const moveToothUp = async (idx) => {
  if (idx <= 0) return;
  const arr = [...toothOrder.value];
  const [item] = arr.splice(idx, 1);
  arr.splice(idx - 1, 0, item);
  try { await commitOrderChange(arr); } catch (e) { console.error(e); }
};

const moveToothDown = async (idx) => {
  if (idx >= toothOrder.value.length - 1) return;
  const arr = [...toothOrder.value];
  const [item] = arr.splice(idx, 1);
  arr.splice(idx + 1, 0, item);
  try { await commitOrderChange(arr); } catch (e) { console.error(e); }
};

const removeTooth = async (idx) => {
  const arr = [...toothOrder.value];
  arr.splice(idx, 1);
  try { await commitOrderChange(arr); } catch (e) { console.error(e); }
};

const addTooth = async () => {
  const val = newToothNumber.value.trim();
  if (!val || toothOrder.value.includes(val)) return;

  const arr = [...toothOrder.value, val];
  try {
    const didChange = await commitOrderChange(arr, val);
    if (didChange) {
      newToothNumber.value = '';
    }
  } catch (e) {
    console.error(e);
  }
};

// --- Drag & Drop Ordering ---
const getDraggedToothFromEvent = (event) => {
  if (draggedToothNumber.value) {
    return draggedToothNumber.value;
  }
  const data = event?.dataTransfer?.getData('text/plain');
  return data ? data.trim() : null;
};

const resetDragState = () => {
  draggedToothIndex.value = null;
  draggedToothNumber.value = null;
  dragOverIndex.value = null;
  isDraggingFromChart.value = false;
};

const handleDragStart = (event, idx) => {
  draggedToothIndex.value = idx;
  dragOverIndex.value = idx;
  draggedToothNumber.value = toothOrder.value[idx];
  isDraggingFromChart.value = false;
  if (event?.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    try {
      event.dataTransfer.setData('text/plain', toothOrder.value[idx]);
    } catch (err) {
      // Some browsers may throw if no dataTransfer; safe to ignore
    }
  }
};

const handleChartToothDragStart = (event, toothNumber) => {
  draggedToothIndex.value = null;
  draggedToothNumber.value = String(toothNumber);
  isDraggingFromChart.value = true;
  dragOverIndex.value = 'list';
  if (!showToothOrderPanel.value) {
    openToothOrderPanel();
  }
  if (event?.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copyMove';
    try {
      event.dataTransfer.setData('text/plain', String(toothNumber));
    } catch (err) {
      // Ignore transfer errors
    }
  }
};

const handleDragOver = (event, idx) => {
  event.preventDefault();
  dragOverIndex.value = idx;
  if (event?.dataTransfer) {
    event.dataTransfer.dropEffect = draggedToothIndex.value !== null ? 'move' : 'copy';
  }
};

const handleDrop = async (event, idx) => {
  event.preventDefault();
  event.stopPropagation();

  let insertIndex = idx;
  const target = event.currentTarget;
  if (target && typeof target.getBoundingClientRect === 'function') {
    const rect = target.getBoundingClientRect();
    const offsetY = event.clientY - rect.top;
    if (offsetY > rect.height / 2) {
      insertIndex = idx + 1;
    }
  } else if (draggedToothIndex.value !== null && draggedToothIndex.value < idx) {
    insertIndex = idx + 1;
  }

  const tooth = getDraggedToothFromEvent(event);
  if (!tooth) {
    resetDragState();
    return;
  }

  const arr = [...toothOrder.value];
  const existingIdx = arr.indexOf(tooth);
  let flashTarget = null;

  if (existingIdx !== -1) {
    const [item] = arr.splice(existingIdx, 1);
    if (existingIdx < insertIndex) {
      insertIndex -= 1;
    }
    insertIndex = Math.max(0, Math.min(insertIndex, arr.length));
    arr.splice(insertIndex, 0, item);
  } else {
    insertIndex = Math.max(0, Math.min(insertIndex, arr.length));
    arr.splice(insertIndex, 0, tooth);
    flashTarget = tooth;
  }

  try {
    await commitOrderChange(arr, flashTarget);
  } catch (e) {
    console.error(e);
  }

  resetDragState();
};

const handleDragLeave = (event, idx = null) => {
  if (!event?.currentTarget?.contains(event?.relatedTarget)) {
    if (idx !== null && dragOverIndex.value === idx) {
      dragOverIndex.value = null;
    } else if (idx === null && dragOverIndex.value === 'list') {
      dragOverIndex.value = null;
    }
  }
};

const handleDragEnd = () => {
  resetDragState();
};

const handleListDragOver = (event) => {
  event.preventDefault();
  dragOverIndex.value = 'list';
  if (event?.dataTransfer) {
    event.dataTransfer.dropEffect = draggedToothIndex.value !== null ? 'move' : 'copy';
  }
};

const handleListDragLeave = (event) => {
  handleDragLeave(event);
};

const handleListDrop = async (event) => {
  event.preventDefault();

  const tooth = getDraggedToothFromEvent(event);
  if (!tooth) {
    resetDragState();
    return;
  }

  const arr = [...toothOrder.value];
  const existingIdx = arr.indexOf(tooth);
  if (existingIdx !== -1) {
    const [item] = arr.splice(existingIdx, 1);
    arr.push(item);
  } else {
    arr.push(tooth);
  }

  try {
    await commitOrderChange(arr, existingIdx === -1 ? tooth : null);
  } catch (e) {
    console.error(e);
  }

  resetDragState();
};

// Recent highlight state for UI feedback
const recentAddedTooth = ref(null);

const flashRecentlyAdded = (tooth) => {
  recentAddedTooth.value = String(tooth);
  setTimeout(() => { recentAddedTooth.value = null; }, 1200);
};

</script>

<style scoped>
.tooth-item {
  min-width: 70px; /* Increased for better spacing with larger images */
  padding-bottom: 24px; /* Increased padding for condition labels */
  transition: all 0.2s ease-in-out;
}

.tooth-item:hover {
  transform: translateY(-2px);
}

.grid {
  grid-template-columns: repeat(16, minmax(0, 1fr));
  gap: 0.125rem; /* Further reduced gap for much closer spacing */
}

/* Enhanced tooth images - removed borders and shadows */
.tooth-item img {
  transition: all 0.2s ease-in-out;
}

.tooth-item:hover img {
  transform: scale(1.05);
  filter: brightness(1.1);
}

/* Smooth animations for hover effects */
.group:hover .opacity-60 {
  opacity: 1;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.97);
}

/* Enhanced scrollbar for hover summary */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 4px;
  margin: 2px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #3b82f6, #1d4ed8);
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #1d4ed8, #1e40af);
}

/* Dark mode scrollbar */
.dark .custom-scrollbar::-webkit-scrollbar-track {
  background: #374151;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #60a5fa, #3b82f6);
  border: 1px solid #4b5563;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #3b82f6, #2563eb);
}

/* Enhanced floating summary animations */
@keyframes slideInFromBottom {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes slideOutToBottom {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
}

.scale-100.opacity-100 {
  animation: slideInFromBottom 0.3s ease-out;
}

/* Enhanced gradient background for the chart */
.bg-gradient-to-br {
  background: linear-gradient(135deg, 
    rgba(239, 246, 255, 0.8) 0%, 
    rgba(224, 231, 255, 0.9) 100%);
}

.dark .bg-gradient-to-br {
  background: linear-gradient(135deg, 
    rgba(17, 24, 39, 0.95) 0%, 
    rgba(31, 41, 55, 0.98) 100%);
}

/* Quadrant divider enhancements */
.bg-gradient-to-r {
  background: linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.6) 50%, transparent 100%);
}

.bg-gradient-to-b {
  background: linear-gradient(180deg, transparent 0%, rgba(59, 130, 246, 0.6) 50%, transparent 100%);
}

/* Enhanced status dots with pulse animation */
.status-dot {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* Grid adjustments for proper 16-column layout */
.grid-cols-16 {
  grid-template-columns: repeat(16, minmax(0, 1fr));
}

/* Grid adjustments for children's 10-column layout */
.grid-cols-10 {
  grid-template-columns: repeat(10, minmax(0, 1fr));
}

/* Floating summary specific styles */
.fixed.bottom-6.right-6 {
  max-width: 650px;
  min-width: 600px;
}

/* Enhanced shadow for floating summary */
.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 
              0 10px 20px -5px rgba(0, 0, 0, 0.1),
              0 0 0 1px rgba(0, 0, 0, 0.05);
}

.dark .shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4), 
              0 10px 20px -5px rgba(0, 0, 0, 0.2),
              0 0 0 1px rgba(255, 255, 255, 0.1);
}

/* Hover states for treatment cards */
.bg-gray-50:hover {
  background-color: rgb(249 250 251);
}

.dark .bg-gray-700\/50:hover {
  background-color: rgba(55, 65, 81, 0.7);
}

/* Prevent scrolling on the dental chart when popup is open */
.pointer-events-auto {
  pointer-events: auto;
}

/* Improved spacing for treatment cards */
.treatment-card {
  transition: all 0.3s ease;
}

.treatment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

/* Better visual hierarchy for financial sections */
.financial-highlight {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(21, 128, 61, 0.1) 100%);
}

.dark .financial-highlight {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(21, 128, 61, 0.2) 100%);
}

/* Enhanced condition highlight */
.condition-highlight {
  background: linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(234, 88, 12, 0.1) 100%);
}

.dark .condition-highlight {
  background: linear-gradient(135deg, rgba(251, 146, 60, 0.2) 0%, rgba(234, 88, 12, 0.2) 100%);
}
</style>
