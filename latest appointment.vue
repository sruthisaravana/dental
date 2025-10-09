 <template>


 



  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <!-- Enhanced Header -->
  <header class="bg-white/80 backdrop-blur-sm shadow-lg border-b border-blue-100">
  <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <CalendarClock class="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 class="text-xl font-bold text-slate-800">Smart Scheduler</h1>
                <p class="text-xs text-slate-500">Dental Practice Management</p>
              </div>
            </div>
          </div>

          <div class="flex items-center space-x-6">
            <div class="hidden sm:flex items-center space-x-4">
              <!-- Friendlier date pill -->
              <div class="inline-flex items-center leading-none text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-1.5 font-medium border border-slate-200">
                {{ currentDate }}
              </div>
            </div>
            
            <!-- <div v-if="currentUser" class="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg px-4 py-2">
              <UserCircle class="w-4 h-4" />
              <span class="text-sm font-medium">Dr. {{ currentUser.first_name || 'User' }}</span>
            </div> -->
          </div>
        </div>
      </div>
    </header>

    <!-- Active Timer Alert (Normal Flow, Not Floating) -->
    <Transition name="slide-down">
      <div v-if="activeAppointment && timing" 
        class="mt-6 mb-6 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl shadow-2xl p-4 border border-red-300">
        <div class="flex items-center space-x-4">
          <div class="w-4 h-4 bg-white rounded-full animate-ping"></div>
          <div class="flex-1">
            <div class="font-bold text-lg">{{ activeAppointment.patient?.first_name }} {{ activeAppointment.patient?.last_name }}</div>
            <div class="text-2xl font-mono font-black tracking-wider">
              {{ formatTimerDisplay(timerMinutes) }}:{{ formatTimerDisplay(timerSeconds) }}
            </div>
            <div class="text-xs opacity-90">Started: {{ formatTime(activeAppointment.actual_start_at) }}</div>
          </div>
          <button @click="completeAppointment" 
                  class="bg-white text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-lg">
            Complete
          </button>
        </div>
      </div>
    </Transition>

  <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Messages -->
      <Transition name="fade">
        <div v-if="error" class="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-xl shadow-sm">
          <div class="flex justify-between items-start">
            <div class="flex items-start">
              <AlertCircle class="w-5 h-5 text-red-400 mt-0.5 mr-3" />
              <div>
                <h3 class="text-sm font-medium text-red-800">Error</h3>
                <p class="mt-1 text-sm text-red-700">{{ error }}</p>
              </div>
            </div>
            <button @click="clearMessages" class="text-red-400 hover:text-red-600">
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>
      </Transition>

      <Transition name="fade">
        <div v-if="successMessage" class="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-r-xl shadow-sm">
          <div class="flex justify-between items-start">
            <div class="flex items-start">
              <CheckCircle class="w-5 h-5 text-green-400 mt-0.5 mr-3" />
              <div>
                <h3 class="text-sm font-medium text-green-800">Success</h3>
                <p class="mt-1 text-sm text-green-700">{{ successMessage }}</p>
              </div>
            </div>
            <button @click="clearMessages" class="text-green-400 hover:text-green-600">
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>
      </Transition>

  <!-- Layout widened further: 8-column grid for better proportions -->
  <div class="grid grid-cols-1 lg:grid-cols-8 gap-6">
        
        <!-- Left Sidebar - Add Patient & Stats -->
  <div class="lg:col-span-2 space-y-6">
          <!-- Add New Patient Card -->
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-shadow">
            <h2 class="text-lg font-semibold text-slate-700 mb-1 flex items-center">
              <UserPlus class="w-5 h-5 text-blue-500 mr-2" />
              Add to Schedule
            </h2>
            <p class="text-xs text-slate-500 mb-4">Quickly add a patient and time to today’s queue</p>
            
            <form @submit.prevent="addPatientToQueue" class="space-y-4">
              <!-- Patient Search with Enhanced Dropdown -->
              <div class="relative">
                <label class="block text-sm font-medium text-slate-600 mb-2">Search Patient</label>
                <div class="relative">
                  <input v-model="patientSearchQuery" 
                         @input="searchPatients" 
                         @focus="showPatientDropdown = true"
                         type="text" 
                         placeholder="Search by name or phone..."
                         class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-slate-400 bg-slate-50 text-slate-800"
                         :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': formError }">
                  
                  <!-- Search Loading -->
                  <div v-if="searchingPatients" class="absolute right-3 top-3.5">
                    <Loader2 class="w-4 h-4 text-slate-400 animate-spin" />
                  </div>
                </div>

                <!-- Enhanced Dropdown -->
                <Transition name="slide-down">
                  <div v-if="showPatientDropdown && (filteredPatients.length > 0 || patientSearchQuery)"
                       class="absolute z-50 w-full mt-2 bg-white border border-slate-300 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                    
                    <!-- Search Results -->
                    <div v-for="patient in filteredPatients.slice(0, 8)" :key="patient.id"
                         @click="selectPatientForAdd(patient)"
                         class="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors">
                      <div class="font-semibold text-slate-700">{{ patient.first_name }} {{ patient.last_name }}</div>
                      <div class="text-xs text-slate-500">{{ patient.phone || patient.email || 'No contact info' }}</div>
                    </div>

                    <!-- No Results -->
                    <div v-if="patientSearchQuery && filteredPatients.length === 0 && !searchingPatients"
                         class="px-4 py-3 text-slate-500 text-sm text-center">
                      No patients found matching "{{ patientSearchQuery }}"
                    </div>

                    <!-- Add New Patient -->
                    <div v-if="patientSearchQuery && patientSearchQuery.length > 2"
                         @click="navigateToCreatePatient"
                         class="px-4 py-3 hover:bg-green-50 cursor-pointer border-t border-slate-200 bg-green-25 flex items-center space-x-2 transition-colors">
                      <Plus class="w-4 h-4 text-green-600" />
                      <span class="text-green-700 font-semibold">Add New: "{{ patientSearchQuery }}"</span>
                    </div>
                  </div>
                </Transition>
              </div>

              <!-- Selected Patient Display -->
              <Transition name="slide-down">
                <div v-if="selectedPatientForAdd" class="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="font-semibold text-blue-900">{{ selectedPatientForAdd.first_name }} {{ selectedPatientForAdd.last_name }}</div>
                      <div class="text-sm text-blue-700">{{ selectedPatientForAdd.phone || selectedPatientForAdd.email }}</div>
                    </div>
                    <button @click="clearSelectedPatient" type="button" class="text-blue-600 hover:text-blue-800">
                      <X class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Transition>

              <!-- Duration Selection with Pills -->
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-3">Duration</label>
                <div class="grid grid-cols-3 gap-2">
                  <button v-for="duration in durationOptions" :key="duration.value"
                          type="button" @click="selectedDuration = duration"
                          class="px-3 py-2 text-sm font-semibold rounded-lg transition-all"
                          :class="selectedDuration.value === duration.value
                            ? 'bg-blue-500 text-white shadow-md transform scale-105'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'">
                    {{ duration.label }}
                  </button>
                </div>
              </div>

              <!-- Treatment Input -->
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-2">Treatment</label>
                <input v-model="appointmentReason" type="text" 
                       placeholder="e.g., Cleaning, Checkup, Filling"
                       class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-50 text-slate-800">
              </div>

              <!-- Form Error -->
              <Transition name="fade">
                <div v-if="formError" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                  {{ formError }}
                </div>
              </Transition>

              <!-- Submit Button -->
              <button type="submit" :disabled="!selectedPatientForAdd || loading"
                      class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                <Icon v-if="loading" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
                <Icon v-else name="lucide:plus" class="w-4 h-4 mr-2" />
                {{ loading ? 'Adding...' : 'Add to Queue' }}
              </button>
            </form>
          </div>

          <!-- Enhanced Statistics Card -->
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 class="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <BarChart class="w-5 h-5 text-blue-600 mr-2" />
              Today's Overview
            </h3>
            <div class="space-y-3">
              <div class="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <span class="text-sm font-semibold text-slate-700">Total Queue</span>
                <span class="text-xl font-bold text-blue-600">{{ queueAppointments.length }}</span>
              </div>
              <div class="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                <span class="text-sm font-semibold text-slate-700">On Timeline</span>
                <span class="text-xl font-bold text-green-600">{{ timelineAppointments.length }}</span>
              </div>
              <div class="flex justify-between items-center p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl border border-amber-200">
                <span class="text-sm font-semibold text-slate-700">In Progress</span>
                <span class="text-xl font-bold text-amber-600 flex items-center">
                  {{ timing ? 1 : 0 }}
                  <span v-if="timing" class="ml-2 w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                </span>
              </div>
              <div class="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                <span class="text-sm font-semibold text-slate-700">Completed</span>
                <span class="text-xl font-bold text-purple-600">{{ getStatusCount('completed') }}</span>
              </div>
            </div>
          </div>
        </div>

  <!-- Main Timeline Section - FIXED UI -->
  <div class="lg:col-span-4">
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <!-- Timeline Header - ALIGNMENT IMPROVED -->
            <div class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <!-- Use grid to perfectly align left info, centered controls, and right stats -->
              <div class="grid gap-4 md:grid-cols-[1fr_auto_auto] items-center">
                <!-- Left: Title + Helper text -->
                <div class="min-w-0">
                  <h2 class="text-xl font-bold flex items-center">
                    <CalendarClock class="w-6 h-6 mr-3" />
                    Daily Timeline
                  </h2>
                  <p class="text-blue-100 text-sm mt-1 truncate">Drag patients from queue to schedule • Current time: {{ currentTime }}</p>
                </div>

                <!-- Center: Date controls as a consistent-height segmented control -->
                <div class="justify-self-center">
                  <div class="inline-flex items-center h-10 bg-white/10 rounded-xl px-1 shadow-inner ring-1 ring-white/20">
                    <button @click="goToPrevDay" class="w-9 h-9 grid place-items-center rounded-lg hover:bg-white/10" title="Previous day">
                      <ChevronLeft class="w-5 h-5" />
                    </button>
                    <input type="date" :value="selectedDate" @change="onDateChange($event)"
                      class="date-input bg-transparent text-white placeholder-blue-100 text-sm h-9 px-3 rounded-md focus:outline-none border border-white/20 text-center" />
                    <button @click="goToNextDay" class="w-9 h-9 grid place-items-center rounded-lg hover:bg-white/10" title="Next day">
                      <ChevronRight class="w-5 h-5" />
                    </button>
                    <button @click="goToToday" class="ml-1 h-9 px-3 text-sm bg-white text-blue-700 font-semibold rounded-md hover:bg-blue-50">
                      Today
                    </button>
                  </div>
                </div>

                <!-- Right: Scheduled count -->
                <div class="justify-self-end text-right">
                  <div class="text-2xl font-bold leading-none">{{ timelineAppointments.length }}</div>
                  <div class="text-sm text-blue-200">Scheduled</div>
                </div>
              </div>
            </div>

            <!-- FIXED Timeline Container -->
            <div class="p-6">
        <div ref="timelineContainer"
          class="relative bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border-2 border-dashed border-slate-300 transition-all"
          :class="[
            { 'border-blue-400 bg-blue-50 shadow-inner': isDragOver },
            pixelsPerHour > 48 ? 'timeline-scrollable' : 'timeline-autoheight'
          ]"
          :style="pixelsPerHour > 48 ? 'max-height: 700px; min-height: 80vh; overflow-y: auto;' : 'min-height: 80vh; max-height: none; overflow-y: visible;'"
          @dragover.prevent="handleDragOver"
          @dragleave="handleDragLeave" 
          @drop="handleDrop"
          @wheel="handleTimelineWheel">
                
                <!-- Time Grid - FIXED with proper spacing -->
                <div class="absolute left-0 top-0 w-20 h-full">
                  <div v-for="hour in timeSlots" :key="hour" 
                       class="text-xs text-slate-600 text-center border-b border-slate-200 flex items-center justify-center font-medium bg-slate-50/50 border-r border-slate-200"
                       :style="{ height: pixelsPerHour + 'px' }">
                    {{ formatHour(hour) }}
                  </div>
                </div>

                <!-- Current Time Indicator - FIXED -->
                <div v-if="selectedDate === new Date().toISOString().split('T')[0]"
              class="absolute left-20 right-4 h-0.5 bg-red-500 z-30 flex items-center"
                     :style="{ top: getCurrentTimePosition() + 'px' }">
                  <div class="w-3 h-3 bg-red-500 rounded-full -ml-1.5 shadow-lg"></div>
                  <!-- <div class="bg-red-500 text-white text-xs px-3 py-1 rounded-full ml-2 font-bold shadow-lg whitespace-nowrap">NOW</div> -->
                </div>

                <!-- Drop Indicator while dragging -->
                <div v-if="dropIndicator.visible"
                     class="absolute left-20 right-4 h-0.5 bg-blue-500 z-30 flex items-center"
                     :style="{ top: dropIndicator.top + 'px' }">
                  <div class="w-2 h-2 bg-blue-500 rounded-full -ml-1 shadow"></div>
                  <div class="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded ml-2 font-bold shadow whitespace-nowrap">
                    {{ dropIndicator.label }}
                  </div>
                </div>

                <!-- Scheduled Appointments on Timeline - CLEANED UP -->
                <div
                  class="relative ml-20 pt-2 timeline-grid"
                  :style="{ backgroundSize: '100% ' + pixelsPerHour + 'px', minHeight: timelineContentHeight + 'px' }">
                  <TransitionGroup name="appointment" tag="div">
        <div v-for="appointment in sortedTimelineAppointments" :key="appointment.id"
          class="absolute bg-white border rounded-md shadow-sm p-1 transition-all hover:shadow-md overflow-hidden compact-appointment relative"
                         :class="[getAppointmentCardClass(appointment), (appointment.status !== 'completed' ? 'cursor-move' : 'cursor-not-allowed')]"
                         :style="getAppointmentPosition(appointment)"
                         @click="handleTimelineCardClick(appointment)"
                         @mouseenter="onTimelineCardEnter($event, appointment)"
                         @mouseleave="hideOverlapPopover"
                         :draggable="appointment.status !== 'completed'"
                         @dragstart="appointment.status !== 'completed' && startDrag($event, appointment)"
                         @dragend="appointment.status !== 'completed' && (draggedItem = null, isDragging = false, dragPreview.visible = false, dropIndicator.visible = false)">

                      <div v-if="hasOverlap(appointment)"
                           class="absolute top-1 right-1 flex items-center space-x-1 text-[10px] font-semibold text-orange-600">
                        <span class="w-2 h-2 bg-orange-500 rounded-full"></span>
                        <span class="uppercase tracking-wide">{{ getOverlapLabel(appointment) }}</span>
                      </div>

                      <!-- COMPACT Timeline Card Content -->
                      <div class="flex flex-row items-center justify-between space-x-1 w-full leading-none">
                        <!-- Name, Phone, Reason -->
                        <div class="flex items-center min-w-0 space-x-1 flex-1">
                          <h3 class="font-bold text-slate-900 text-xs truncate max-w-[90px]">
                            {{ appointment.patient.first_name }} {{ appointment.patient.last_name }}
                          </h3>
                          <span class="text-[11px] bg-slate-100 text-slate-600 px-1 py-0.5 rounded">
                            {{ appointment.patient.phone || 'No phone' }}
                          </span>
                          <span v-if="
                            ((appointment.reason && appointment.reason.trim() && appointment.reason.trim().toLowerCase() !== 'general checkup')
                            || (appointment.treatment && appointment.treatment.trim() && appointment.treatment.trim().toLowerCase() !== 'general checkup'))"
                            class="text-[11px] text-slate-600 truncate max-w-[70px]">
                            {{
                              appointment.reason && appointment.reason.trim() && appointment.reason.trim().toLowerCase() !== 'general checkup'
                                ? appointment.reason
                                : appointment.treatment
                            }}
                          </span>
                        </div>
                        <!-- Time Range -->
                        <div class="text-[11px] font-semibold text-blue-600 whitespace-nowrap">
                          {{ getDisplayTimeRange(appointment) }}
                        </div>
                        <!-- Duration (if completed) -->
                        <div v-if="appointment.status === 'completed' && appointment.actual_end_at" class="text-[11px] text-purple-700 font-medium whitespace-nowrap">
                          {{ getActualDuration(appointment) }}min
                        </div>
                        <!-- Status Badge -->
                        <span class="text-[10px] px-1 py-0.5 rounded-full font-bold uppercase tracking-wide ml-2 whitespace-nowrap"
                              :class="getStatusBadgeClass(appointment.status)">
                          {{ appointment.status }}
                        </span>
                        <!-- Actions -->
                        <div class="flex items-center space-x-1 ml-2">
                          <button v-if="appointment.status !== 'completed'"
                                  @click.stop="startAppointment(appointment)"
                                  class="px-2 py-0.5 text-[11px] rounded-full font-semibold transition-all shadow-sm"
                                  :class="timing && activeAppointment?.id === appointment.id 
                                    ? 'bg-red-500 text-white hover:bg-red-600' 
                                    : 'bg-green-600 text-white hover:bg-green-700'">
                            {{ timing && activeAppointment?.id === appointment.id ? 'Stop' : 'Start' }}
                          </button>
                          <button v-if="appointment.status === 'completed'" 
                                  @click.stop="showTimeEditModal(appointment)"
                                  class="px-1 py-0.5 text-[11px] bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 font-semibold transition-all">
                            Edit
                          </button>
                          <button @click.stop="removeFromTimeline(appointment.id)"
                                  class="px-1 py-0.5 text-[11px] bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-all"
                                  title="Remove from timeline">
                            <X class="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </TransitionGroup>
                  <!-- Overlap Popover -->
                  <div v-if="overlapPopover.visible" class="absolute z-40 bg-white border border-slate-200 rounded-xl shadow-xl p-3 text-xs w-[280px]" :style="{ top: overlapPopover.y + 'px', left: overlapPopover.x + 'px' }" @mouseenter="keepOverlapPopover" @mouseleave="hideOverlapPopover">
                    <div class="font-semibold text-slate-700 mb-2">Overlapping appointments</div>
                    <div class="space-y-2">
                      <div v-for="apt in overlapPopover.items" :key="apt.id" class="p-2 rounded-lg bg-slate-50 border border-slate-200">
                        <div class="font-bold text-slate-900 truncate">{{ apt.patient.first_name }} {{ apt.patient.last_name }}</div>
                        <div class="text-blue-700 font-medium">{{ getDisplayTimeRange(apt) }}</div>
                        <div class="text-slate-600 truncate">{{ apt.reason || apt.treatment || 'Checkup' }}</div>
                        <div class="text-[10px] uppercase tracking-wide mt-1 inline-block px-2 py-0.5 rounded-full" :class="getStatusBadgeClass(apt.status)">{{ apt.status }}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Empty State -->
                <div v-if="timelineAppointments.length === 0" 
                     class="flex flex-col items-center justify-center h-64 text-slate-400 ml-20">
                  <CalendarClock class="w-16 h-16 mb-4 text-slate-300" />
                  <p class="text-xl font-bold text-slate-500">No appointments scheduled</p>
                  <p class="text-sm text-slate-400 mt-2">Drag patients from the queue to schedule them</p>
                </div>
              </div>
            </div>
          </div>
        </div>

  <!-- Right Sidebar - Patient Queue - ENHANCED COMPACT DESIGN -->
  <div class="lg:col-span-2">
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 h-fit">
            <!-- Queue Header -->
            <div class="p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
              <h3 class="text-lg font-bold text-slate-800 flex items-center">
                <Users class="w-5 h-5 text-indigo-600 mr-2" />
                Patient Queue
                <span class="ml-2 bg-indigo-100 text-indigo-800 text-sm font-semibold px-3 py-1 rounded-full">
                  {{ queueAppointments.length }}
                </span>
              </h3>
              <p class="text-sm text-slate-600 mt-1">
                <span class="text-green-600 font-semibold">{{ timelineAppointments.length }} scheduled</span>
                • 
                <span class="text-slate-600">{{ queueAppointments.length - timelineAppointments.length }} waiting</span>
              </p>
            </div>

            <!-- Queue List - COMPACT, ALIGNED, NO DEFAULT REASON -->
            <div class="p-1 max-h-[calc(100vh-400px)] overflow-y-auto">
              <div class="space-y-0.5"
                   @dragover.prevent="handleQueueDragOver"
                   @drop.prevent="handleQueueDrop">
                <TransitionGroup name="queue-item" tag="div">
                  <div v-for="(appointment, index) in queueAppointments" :key="appointment.id"
                       draggable="true"
                       @dragstart="startQueueDrag($event, appointment, index)"
                       @dragend="endQueueDrag"
                       class="queue-item group border rounded-lg p-2 cursor-move hover:shadow transition-all bg-white hover:bg-slate-25 relative flex items-center"
                       :class="[getQueueItemClass(appointment), queueDragState.draggedIndex === index ? 'opacity-50' : '']"
                       @click="selectAppointment(appointment)">
                    <!-- Position & Status -->
                    <div class="flex flex-col items-center mr-2">
                      <div class="w-5 h-5 rounded flex items-center justify-center text-xs font-bold"
                           :class="isAppointmentOnTimeline(appointment.id) ? 'bg-green-500 text-white' : 'bg-slate-300 text-slate-700'">
                        {{ index + 1 }}
                      </div>
                      <div :class="isAppointmentOnTimeline(appointment.id) ? 'w-1 h-1 bg-green-500 rounded-full mt-1' : 'w-1 h-1 bg-slate-400 rounded-full mt-1'"></div>
                    </div>
                    <!-- Patient Info -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between">
                        <span class="text-sm font-semibold text-slate-900 truncate">{{ appointment.patient.first_name }} {{ appointment.patient.last_name }}</span>
                        <span class="ml-2 text-xs text-slate-500">{{ appointment.patient.phone || '' }}</span>
                      </div>
                      <div class="flex items-center space-x-1 mt-0.5">
                        <span class="text-xs text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded">{{ appointment.duration || 30 }}min</span>
                        <span v-if="isAppointmentOnTimeline(appointment.id)" class="text-xs text-green-700 font-semibold bg-green-50 px-1.5 py-0.5 rounded">{{ getScheduledTimeForAppointment(appointment.id) }}</span>
                        <span v-if="appointment.reason || appointment.treatment" class="text-xs text-slate-600 truncate">{{ appointment.reason || appointment.treatment }}</span>
                      </div>
                    </div>
                    <!-- Actions -->
                    <div class="flex flex-col items-end ml-2 space-y-1">
                      <!-- Add to Timeline Button -->
                      <button v-if="!isAppointmentOnTimeline(appointment.id)"
                              @click.stop="addToTimelineAtCurrentTime(appointment)"
                              class="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full"
                              title="Add to timeline at current time">
                        <Plus class="w-4 h-4" />
                      </button>
                      <button @click.stop="deleteAppointment(appointment.id)"
                              class="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                              title="Delete appointment from queue (removes everywhere)">
                        <Trash2 class="w-4 h-4" />
                      </button>
                      <div class="flex space-x-1">
                        <button @click.stop="reorderInQueue(appointment.id, 'up')"
                                :disabled="index === 0"
                                class="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded disabled:opacity-30"
                                title="Move up">
                          <ChevronUp class="w-3 h-3" />
                        </button>
                        <button @click.stop="reorderInQueue(appointment.id, 'down')"
                                :disabled="index === queueAppointments.length - 1"
                                class="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded disabled:opacity-30"
                                title="Move down">
                          <ChevronDown class="w-3 h-3" />
                        </button>
                      </div>
                      <div class="text-[11px] leading-tight text-slate-500 text-right min-w-[60px]">
                        <div class="font-medium capitalize">{{ appointment.status || 'pending' }}</div>
                      </div>
                    </div>
                    <!-- Active Treatment Indicator -->
                    <div v-if="activeAppointment?.id === appointment.id && timing"
                         class="absolute top-0 left-0 w-full h-full bg-red-100 opacity-20 rounded-lg pointer-events-none"></div>
                    <!-- Drag Drop Indicator -->
                    <div v-if="dragDropIndicator.visible && dragDropIndicator.position === index"
                         class="absolute -top-1 left-0 right-0 h-0.5 bg-blue-500 rounded-full z-10"></div>
                  </div>
                </TransitionGroup>
              </div>
              <!-- Empty Queue State -->
              <div v-if="queueAppointments.length === 0" class="flex flex-col items-center justify-center py-8 text-slate-400">
                <UserPlus class="w-8 h-8 mb-2 text-slate-300" />
                <p class="font-semibold text-slate-500 text-sm">Queue is empty</p>
                <p class="text-xs text-slate-400 mt-1">Add patients to get started</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Time Edit Modal -->
    <Transition name="modal">
      <div v-if="timeEditModal.visible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-slate-800">Edit Appointment Times</h3>
            <button @click="hideTimeEditModal" class="text-slate-400 hover:text-slate-600">
              <X class="w-5 h-5" />
            </button>
          </div>

          <div v-if="timeEditModal.appointment" class="mb-6">
            <div class="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div class="font-bold text-blue-900">{{ timeEditModal.appointment.patient.first_name }} {{ timeEditModal.appointment.patient.last_name }}</div>
              <div class="text-sm text-blue-700">{{ timeEditModal.appointment.duration }}min • {{ timeEditModal.appointment.reason || timeEditModal.appointment.treatment }}</div>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">Actual Start Time</label>
              <input v-model="timeEditModal.startTime" type="time"
                     class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">Actual End Time</label>
              <input v-model="timeEditModal.endTime" type="time"
                     class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            </div>

            <div v-if="timeEditModal.startTime && timeEditModal.endTime" class="p-4 bg-green-50 rounded-xl">
              <div class="text-sm text-green-800 font-semibold">
                Duration: {{ calculateDuration(timeEditModal.startTime, timeEditModal.endTime) }} minutes
              </div>
            </div>
          </div>

          <div class="flex space-x-3 mt-8">
            <button @click="hideTimeEditModal"
                    class="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold transition-all">
              Cancel
            </button>
            <button @click="saveManualTimes" :disabled="!timeEditModal.startTime || !timeEditModal.endTime || loading"
                    class="flex-1 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 font-semibold transition-all">
              <Icon v-if="loading" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
              Save Times
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Drag Preview - IMPROVED -->
    <div v-if="isDragging && dragPreview.visible"
         class="fixed pointer-events-none z-50 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl shadow-2xl text-sm font-semibold border-2 border-blue-400 max-w-xs"
         :style="{ left: dragPreview.x + 'px', top: dragPreview.y + 'px' }">
      <div class="text-xs text-blue-200 mb-1 truncate">{{ dragPreview.patientName }}</div>
      <div class="font-bold text-base truncate">{{ dragPreview.timeRange }}</div>
      <div class="text-xs text-blue-200 mt-1">{{ dragPreview.duration }} minutes</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  CalendarClock,
  UserCircle,
  AlertCircle,
  X,
  CheckCircle,
  UserPlus,
  Loader2,
  Plus,
  BarChart,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Users,
  GripVertical,
  ChevronUp,
  ChevronDown
} from 'lucide-vue-next'

// Configuration
const config = useRuntimeConfig()
const API_BASE_URL = config.public?.API_BASE_URL || '/api'

// Core State Management  
const error = ref(null)
const successMessage = ref(null) 
const loading = ref(false)
const currentUser = ref(null)
const currentTime = ref('')
const selectedDate = ref(new Date().toISOString().split('T')[0])

// Appointments State
const queueAppointments = ref([])
const timelineAppointments = ref([])
const activeAppointment = ref(null)
const selectedAppointment = ref(null)

// Timer State
const timing = ref(false)
const timerMinutes = ref(0)
const timerSeconds = ref(0)
const timerInterval = ref(null)

// UI State
const isDragOver = ref(false)
const isDragging = ref(false)
const draggedItem = ref(null)
const timelineContainer = ref(null)
// Live drop indicator
const dropIndicator = ref({ visible: false, top: 0, label: '' })

// Zoom state (pixels per hour). Default 48px; allow much higher zoom range
const pixelsPerHour = ref(48)
const minPixelsPerHour = 32
const maxPixelsPerHour = 300 // Increased for better zoom capability

// Overlap popover
const overlapPopover = ref({ visible: false, x: 0, y: 0, items: [] })

// Queue Drag State
const queueDragState = ref({
  draggedIndex: -1,
  draggedItem: null,
  isDragging: false
})

// Drag drop indicator for queue reordering
const dragDropIndicator = ref({
  visible: false,
  position: -1
})

// Patient Search State
const patientSearchQuery = ref('')
const filteredPatients = ref([])
const showPatientDropdown = ref(false)
const selectedPatientForAdd = ref(null)
const searchingPatients = ref(false)
const appointmentReason = ref('')
const formError = ref(null)
const allPatientsCache = ref([])

// Drag preview
// Drag preview 

const dragPreview = ref({
  visible: false,
  x: 0,
  y: 0,
  timeRange: '',
  patientName: '',
  duration: 0
})

// Duration options
const selectedDuration = ref({ label: '30min', value: 30 })
const durationOptions = ref([
  { label: '15min', value: 15 },
  { label: '30min', value: 30 },
  { label: '45min', value: 45 },
  { label: '1hr', value: 60 },
  { label: '90min', value: 90 },
  { label: '2hr', value: 120 }
])

// Time edit modal
const timeEditModal = ref({
  visible: false,
  appointment: null,
  startTime: '',
  endTime: ''
})

// FIXED: Time slots for normal business hours
const timeSlots = computed(() => {
  const slots = []
  for (let hour = 9; hour <= 23; hour++) {
    slots.push(hour)
  }
  return slots
})

// Computed Properties
const currentDate = computed(() => {
  const d = new Date()
  const day = String(d.getDate()).padStart(2, '0')
  const monthShort = d.toLocaleString('en-US', { month: 'short' }).toLowerCase()
  const year = d.getFullYear()
  const weekday = d.toLocaleString('en-US', { weekday: 'long' }).toLowerCase()
  return `${day} ${monthShort} ${year} (${weekday})`
})

// Sort by actual start time when available, else by scheduled time
const sortedTimelineAppointments = computed(() => {
  return [...timelineAppointments.value].sort((a, b) => {
    const aTime = parseTime(a.actual_start_at) ?? parseTime(a.scheduled_at) ?? 0
    const bTime = parseTime(b.actual_start_at) ?? parseTime(b.scheduled_at) ?? 0
    return aTime - bTime
  })
})

// Compute non-overlapping layout lanes per overlapping cluster
const getStartMinutes = (apt) => (parseTime(apt.actual_start_at) ?? parseTime(apt.scheduled_at) ?? 9 * 60)
const getEndMinutes = (apt) => {
  // Prefer actual duration if completed; if in-progress, use elapsed; else planned duration
  const start = getStartMinutes(apt)
  let dur = apt.duration || 30
  if (apt.actual_start_at && apt.actual_end_at) {
    const s = new Date(apt.actual_start_at)
    const e = new Date(apt.actual_end_at)
    dur = Math.max(0, Math.round((e - s) / 60000)) || dur
  } else if (apt.actual_start_at && activeAppointment.value?.id === apt.id && timing.value) {
    const s = new Date(apt.actual_start_at)
    dur = Math.max(0, Math.round((Date.now() - s.getTime()) / 60000)) || dur
  }
  return start + dur
}

const timelineLayout = computed(() => {
  const appointments = sortedTimelineAppointments.value
  if (appointments.length === 0) return {}

  const px = pixelsPerHour.value
  const baseOffset = 8
  const overlapGap = 12

  const items = appointments.map(apt => {
    const startMinutes = getStartMinutes(apt)
    const endMinutes = getEndMinutes(apt)
    const clampedStart = Math.max(startMinutes, 9 * 60)
    const top = ((clampedStart - 9 * 60) / 60) * px + baseOffset

    let durationMinutes = apt.duration || 30
    if (apt.actual_start_at && apt.actual_end_at) {
      durationMinutes = getActualDuration(apt)
    } else if (apt.actual_start_at && activeAppointment.value?.id === apt.id && timing.value) {
      const startedAt = new Date(apt.actual_start_at)
      durationMinutes = Math.max(0, Math.round((Date.now() - startedAt.getTime()) / 60000)) || durationMinutes
    }

    const height = Math.max(120, (durationMinutes / 60) * px)

    return {
      apt,
      startMinutes,
      endMinutes,
      baseTop: top,
      height
    }
  })

  const groups = []
  let currentGroup = []
  let currentEnd = -Infinity

  for (const item of items) {
    if (currentGroup.length === 0) {
      currentGroup.push(item)
      currentEnd = item.endMinutes
      continue
    }

    if (item.startMinutes < currentEnd) {
      currentGroup.push(item)
      currentEnd = Math.max(currentEnd, item.endMinutes)
    } else {
      groups.push(currentGroup)
      currentGroup = [item]
      currentEnd = item.endMinutes
    }
  }

  if (currentGroup.length) {
    groups.push(currentGroup)
  }

  const layout = {}
  let cumulativeOffset = 0

  for (const group of groups) {
    const sortedGroup = group.slice().sort((a, b) => a.startMinutes - b.startMinutes)
    const groupBaseTop = Math.min(...sortedGroup.map(item => item.baseTop))
    const baselineBottom = Math.max(...sortedGroup.map(item => item.baseTop + item.height))

    let lastBottom = null

    sortedGroup.forEach((item, index) => {
      const desiredTop = item.baseTop + cumulativeOffset
      const gapBefore = lastBottom === null ? 0 : overlapGap
      const stackedTop = lastBottom === null ? desiredTop : lastBottom + gapBefore
      const top = Math.max(desiredTop, stackedTop)

      layout[item.apt.id] = {
        top,
        height: item.height,
        overlapCount: sortedGroup.length,
        stackIndex: index
      }

      lastBottom = top + item.height
    })

    const stackedBottom = lastBottom ?? (groupBaseTop + cumulativeOffset)
    const stackedHeight = stackedBottom - (groupBaseTop + cumulativeOffset)
    const baselineHeight = baselineBottom - groupBaseTop
    const additionalOffset = Math.max(0, stackedHeight - baselineHeight)

    cumulativeOffset += additionalOffset
  }

  return layout
})

const timelineContentHeight = computed(() => {
  const layoutEntries = Object.values(timelineLayout.value)
  if (layoutEntries.length === 0) {
    return (24 - 9) * pixelsPerHour.value
  }

  const maxBottom = layoutEntries.reduce((max, entry) => {
    if (!entry || typeof entry !== 'object') return max
    const bottom = (entry.top || 0) + (entry.height || 0)
    return Math.max(max, bottom)
  }, 0)

  return Math.max(maxBottom + 40, (24 - 9) * pixelsPerHour.value)
})

const hasOverlap = (appointment) => {
  const layout = timelineLayout.value[appointment.id]
  return (layout?.overlapCount || 0) > 1
}

const getOverlapLabel = (appointment) => {
  const count = timelineLayout.value[appointment.id]?.overlapCount || 0
  if (count <= 1) return ''
  return `${count} overlapping`
}

// Helper Functions
const clearMessages = () => {
  error.value = null
  successMessage.value = null
}

const updateTime = () => {
  currentTime.value = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

const formatTimerDisplay = (value) => {
  return value.toString().padStart(2, '0')
}

// FIXED: Normal time formatting
const formatHour = (hour) => {
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${displayHour}:00 ${period}`
}

const formatTime = (isoString) => {
  if (!isoString) return null
  const date = new Date(isoString)
  let hours = date.getHours()
  const minutes = date.getMinutes()
  const period = hours >= 12 ? 'PM' : 'AM'
  
  if (hours > 12) hours -= 12
  if (hours === 0) hours = 12
  
  return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`
}

const parseTime = (isoString) => {
  if (!isoString) return null
  const date = new Date(isoString)
  return date.getHours() * 60 + date.getMinutes()
}

// FIXED: Current time position calculation
const getCurrentTimePosition = () => {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  
  if (currentHour < 9 || currentHour >= 24) return 0
  
  const hoursSince9 = currentHour - 9
  const px = pixelsPerHour.value
  const position = (hoursSince9 * px) + (currentMinute / 60 * px) + 8 // Added offset for proper positioning
  return position
}

// IMPROVED: Appointment positioning on timeline with proper overlap handling
const getAppointmentPosition = (appointment) => {
  const layout = timelineLayout.value[appointment.id]

  if (!layout) {
    const startMinutes = parseTime(appointment.actual_start_at) ?? parseTime(appointment.scheduled_at) ?? (9 * 60)
    const startHour = Math.floor(startMinutes / 60)
    const startMinuteOffset = startMinutes % 60

    if (startHour < 9) return { top: '8px', height: '120px', zIndex: 5, left: '0%', width: '100%' }

    const hoursSince9 = startHour - 9
    const px = pixelsPerHour.value
    const topPosition = (hoursSince9 * px) + (startMinuteOffset / 60 * px) + 8

    let durationMinutes = appointment.duration || 30
    if (appointment.actual_start_at && appointment.actual_end_at) {
      durationMinutes = getActualDuration(appointment)
    }

    const fallbackHeight = Math.max(120, (durationMinutes / 60) * pixelsPerHour.value)

    return {
      top: `${topPosition}px`,
      height: `${fallbackHeight}px`,
      zIndex: 5,
      left: '0%',
      width: '100%',
      borderRadius: '8px'
    }
  }

  let zIndex = 10 + (layout.stackIndex ?? 0)
  if (selectedAppointment.value?.id === appointment.id) zIndex += 10
  if (activeAppointment.value?.id === appointment.id && timing.value) zIndex += 15

  return {
    top: `${layout.top}px`,
    height: `${layout.height}px`,
    zIndex,
    left: '0%',
    width: '100%',
    border: hasOverlap(appointment) ? '2px solid rgba(249, 115, 22, 0.35)' : undefined,
    borderRadius: '8px'
  }
}

// FIXED: Drop position calculation (improved for zoom/scroll)
const calculateDropPosition = (event) => {
  if (!timelineContainer.value) return 9 * 60
  const rect = timelineContainer.value.getBoundingClientRect()
  // Add scrollTop to account for vertical scroll when zoomed
  const scrollTop = timelineContainer.value.scrollTop || 0
  const y = event.clientY - rect.top - 8 + scrollTop // Account for padding and scroll
  const hourPosition = Math.max(0, y / pixelsPerHour.value)
  const timeMinutes = (9 * 60) + (hourPosition * 60)
  // Snap to 15-minute intervals
  const snapInterval = 15
  const snappedMinutes = Math.round(timeMinutes / snapInterval) * snapInterval
  return Math.max(snappedMinutes, 9 * 60)
}

// Determine if a timeline card is very tight with neighbors: collapse details
const isTightCard = (appointment) => {
  const layout = timelineLayout.value[appointment.id]
  if (!layout) return false
  return (layout.overlapCount ?? 1) > 1 || layout.height < 130
}

// On hover, if multiple items are within 10px vertically and overlapping, show popover list
const onTimelineCardEnter = (evt, appointment) => {
  const rect = evt.currentTarget.getBoundingClientRect()
  const yMid = rect.top + rect.height / 2
  const containerRect = timelineContainer.value?.getBoundingClientRect()
  const yLocal = yMid - (containerRect?.top || 0)
  // find neighbors that overlap in time window threshold
  const items = sortedTimelineAppointments.value.filter(a => {
    if (a.id === appointment.id) return true
    const sA = getStartMinutes(a)
    const eA = getEndMinutes(a)
    const sB = getStartMinutes(appointment)
    const eB = getEndMinutes(appointment)
    return sA < eB && sB < eA
  })
  // only show if more than 1 and cards are close vertically
  if (items.length > 1) {
    overlapPopover.value = {
      visible: true,
      x: rect.left - (containerRect?.left || 0) + 40,
      y: yLocal - 20,
      items
    }
  }
}

const keepOverlapPopover = () => {
  overlapPopover.value.visible = true
}

const hideOverlapPopover = () => {
  overlapPopover.value.visible = false
}

// Scroll to zoom handler
const handleTimelineWheel = (e) => {
  if (!e.ctrlKey && !e.metaKey) return // require Ctrl/Cmd to zoom; normal scroll remains page scroll
  e.preventDefault()
  const delta = e.deltaY
  const step = 8
  const next = Math.min(maxPixelsPerHour, Math.max(minPixelsPerHour, pixelsPerHour.value - Math.sign(delta) * step))
  if (next === pixelsPerHour.value) return
  // Optional: anchor zoom around cursor Y so content appears to zoom centered
  const container = timelineContainer.value
  if (container) {
    const rect = container.getBoundingClientRect()
    const cursorOffset = e.clientY - rect.top
    const ratio = cursorOffset / (rect.height || 1)
    // Adjust scroll by ratio of change to keep cursor-aligned content in place
    const prevPx = pixelsPerHour.value
    pixelsPerHour.value = next
    // Force reflow after value change, then scroll
    requestAnimationFrame(() => {
      const newRect = container.getBoundingClientRect()
      const deltaPx = (next - prevPx) * 8 // approximate per 8 hours visible baseline
      container.scrollTop = Math.max(0, container.scrollTop + deltaPx * ratio)
    })
  } else {
    pixelsPerHour.value = next
  }
}

// Display helper: Prefer actual time range with live elapsed time for in-progress
const getDisplayTimeRange = (appointment) => {
  if (appointment.actual_start_at) {
    const startStr = formatTime(appointment.actual_start_at)
    if (appointment.actual_end_at && appointment.status === 'completed') {
      return `${startStr} - ${formatTime(appointment.actual_end_at)}`
    }
    // For in-progress appointments, show elapsed time
    if (appointment.status === 'in-progress' && activeAppointment.value?.id === appointment.id && timing.value) {
      const elapsed = timerMinutes.value + (timerSeconds.value >= 30 ? 1 : 0) // Round up if past 30 seconds
      return `${startStr} (${elapsed}min elapsed)`
    }
    // Predict end as start + planned duration while running
    const startMin = parseTime(appointment.actual_start_at) || 0
    const endMin = startMin + (appointment.duration || 30)
    const endHour = Math.floor(endMin / 60)
    const endMinutes = endMin % 60
    const endPeriod = endHour >= 12 ? 'PM' : 'AM'
    const endDisplayHour = endHour > 12 ? endHour - 12 : endHour === 0 ? 12 : endHour
    return `${startStr} - ${endDisplayHour}:${endMinutes.toString().padStart(2, '0')} ${endPeriod}`
  }
  // Fall back to scheduled range
  const startStr = formatTime(appointment.scheduled_at)
  if (!startStr) return '—'
  const startMinutes = parseTime(appointment.scheduled_at) || (9 * 60)
  const endMinutes = startMinutes + (appointment.duration || 30)
  const endHour = Math.floor(endMinutes / 60)
  const endMin = endMinutes % 60
  const period = endHour >= 12 ? 'PM' : 'AM'
  const displayHour = endHour > 12 ? endHour - 12 : endHour === 0 ? 12 : endHour
  return `${startStr} - ${displayHour}:${endMin.toString().padStart(2, '0')} ${period}`
}

const getActualDuration = (appointment) => {
  if (!appointment.actual_start_at || !appointment.actual_end_at) return appointment.duration || 0
  const s = new Date(appointment.actual_start_at)
  const e = new Date(appointment.actual_end_at)
  const mins = Math.round((e - s) / 60000)
  return mins > 0 ? mins : 0
}

const getStatusCount = (status) => {
  return [...queueAppointments.value, ...timelineAppointments.value]
    .filter(apt => apt.status === status).length
}

const getAppointmentCardClass = (appointment) => {
  if (activeAppointment.value?.id === appointment.id && timing.value) {
    return 'border-red-400 bg-red-50 shadow-red-200'
  }
  if (selectedAppointment.value?.id === appointment.id) {
    return 'border-blue-400 bg-blue-50 shadow-blue-200'
  }
  if (appointment.status === 'completed') {
    return 'border-green-300 bg-green-50 shadow-green-200'
  }
  return 'border-slate-300 bg-white hover:border-slate-400 shadow-slate-200'
}

// FIXED: Queue item status based on timeline presence
const isAppointmentOnTimeline = (appointmentId) => {
  return timelineAppointments.value.some(apt => apt.id === appointmentId)
}

const getScheduledTimeForAppointment = (appointmentId) => {
  const timelineApt = timelineAppointments.value.find(apt => apt.id === appointmentId)
  if (!timelineApt) return null
  return formatTime(timelineApt.actual_start_at || timelineApt.scheduled_at)
}

const getQueueItemClass = (appointment) => {
  const isOnTimeline = isAppointmentOnTimeline(appointment.id)
  
  if (selectedAppointment.value?.id === appointment.id) {
    return isOnTimeline 
      ? 'border-green-400 bg-green-50 shadow-green-200 ring-2 ring-green-200' 
      : 'border-blue-400 bg-blue-50 shadow-blue-200 ring-2 ring-blue-200'
  }
  
  if (isOnTimeline) {
    return 'border-green-300 bg-gradient-to-r from-green-25 to-green-50 hover:border-green-400 shadow-green-100 ring-1 ring-green-200'
  }
  
  return 'border-slate-200 bg-white hover:border-slate-300 shadow-slate-100 hover:bg-slate-25'
}

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-purple-100 text-purple-800'
    case 'in-progress':
      return 'bg-amber-100 text-amber-800'
    case 'scheduled':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-slate-100 text-slate-800'
  }
}

const getStatusDotClass = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-purple-500'
    case 'in-progress':
      return 'bg-amber-500 animate-pulse'
    case 'scheduled':
      return 'bg-green-500'
    default:
      return 'bg-slate-400'
  }
}

// API Helper
const getAuthToken = () => {
  const token = useCookie('dental_access_token')
  return token.value
}

const makeApiCall = async (method, endpoint, data = null) => {
  const token = getAuthToken()
  if (!token) {
    await navigateTo('/login')
    return null
  }

  try {
    loading.value = true
    const config = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }

    if (data) {
      config.body = JSON.stringify(data)
    }

    const response = await $fetch(`${API_BASE_URL}${endpoint}`, config)
    return response
  } catch (err) {
    // Normalize error similar to axios to avoid "axios error" mismatches
    const status = err?.statusCode || err?.response?.status || err?.status || 0
    const data = err?.data || { error: err?.message || 'Request failed' }
    console.error(`API Error (${method} ${endpoint}) [${status}]:`, data)
    if (status === 401) {
      await navigateTo('/login')
    }
    // Throw a consistent shape used by callers (status, data)
    throw { status, data }
  } finally {
    loading.value = false
  }
}

// Core API Functions
const fetchCurrentUser = async () => {
  try {
    const response = await makeApiCall('GET', '/users/me')
    currentUser.value = response
  } catch (err) {
    error.value = 'Failed to fetch user information'
  }
}

const fetchPatients = async () => {
  try {
    searchingPatients.value = true
    const response = await makeApiCall('GET', '/patients?per_page=500')
    allPatientsCache.value = response.patients || response.data || []
  } catch (err) {
    error.value = 'Could not fetch patients'
  } finally {
    searchingPatients.value = false
  }
}

const fetchDailySchedule = async (date = null) => {
  try {
    const targetDate = date || selectedDate.value
    
    // Stop any active timing when changing dates
    if (date && date !== selectedDate.value && timing.value) {
      timing.value = false
      stopTimer()
      activeAppointment.value = null
    }
    
    const response = await makeApiCall('GET', `/daily-schedule/${targetDate}`)
    
    // Separate queue and timeline appointments based on timeline_added field
    const appointments = response.appointments || []
    const unscheduledAppointments = response.unscheduled_appointments || []
    
    // FIXED: Queue should show ALL appointments with proper indicators
    // Combine all appointments for the queue display
    const allAppointments = [...unscheduledAppointments, ...appointments]
    queueAppointments.value = allAppointments
    
  // Timeline shows only scheduled appointments
  timelineAppointments.value = appointments.filter(apt => apt.timeline_added && (apt.scheduled_at || apt.actual_start_at))
  
    // Enhanced auto-resume timer for in-progress appointments
    // Check both regular appointments and unscheduled ones for in-progress status
    const allAptsToCheck = [...appointments, ...unscheduledAppointments]
    
    console.log('🔍 Checking for in-progress appointments:', {
      totalAppointments: allAptsToCheck.length,
      allStatuses: allAptsToCheck.map(a => ({ id: a.id, status: a.status, actual_start_at: a.actual_start_at, actual_end_at: a.actual_end_at }))
    })
    
    const inProgressAppointment = allAptsToCheck.find(a => {
      const isInProgress = (a.status === 'in-progress' || a.status === 'started')
      const hasStartTime = !!a.actual_start_at
      const isCompletedStatus = a.status === 'completed'
      const shouldTreatAsActive = isInProgress && hasStartTime && !isCompletedStatus

      console.log(`Checking appointment ${a.id}:`, {
        isInProgress,
        hasStartTime,
        status: a.status,
        actual_end_at: a.actual_end_at,
        isCompletedStatus,
        shouldTreatAsActive
      })

      return shouldTreatAsActive
    })
    
    console.log('🎯 In-progress appointment result:', {
      found: !!inProgressAppointment,
      appointmentDetails: inProgressAppointment ? {
        id: inProgressAppointment.id,
        status: inProgressAppointment.status,
        patient: inProgressAppointment.patient?.first_name + ' ' + inProgressAppointment.patient?.last_name,
        actual_start_at: inProgressAppointment.actual_start_at,
        actual_end_at: inProgressAppointment.actual_end_at
      } : null
    })
    
    if (inProgressAppointment) {
      // Check if we need to resume or continue timing
      const shouldResume = !activeAppointment.value || 
                          activeAppointment.value.id !== inProgressAppointment.id ||
                          !timing.value
      
      console.log('🔄 Should resume?', { shouldResume, currentActive: activeAppointment.value?.id, timing: timing.value })
      
      if (shouldResume) {
        // Found an in-progress appointment - resume timing
        const resumed = { ...inProgressAppointment, actual_end_at: null, status: 'in-progress' }
        activeAppointment.value = resumed

        const timelineIndex = timelineAppointments.value.findIndex(a => a.id === resumed.id)
        if (timelineIndex !== -1) {
          timelineAppointments.value[timelineIndex] = {
            ...timelineAppointments.value[timelineIndex],
            status: 'in-progress',
            actual_end_at: null
          }
        }

        const queueIndex = queueAppointments.value.findIndex(a => a.id === resumed.id)
        if (queueIndex !== -1) {
          queueAppointments.value[queueIndex] = {
            ...queueAppointments.value[queueIndex],
            status: 'in-progress',
            actual_end_at: null
          }
        }
        
        // Calculate elapsed time since start
        const startTime = new Date(inProgressAppointment.actual_start_at)
        const currentTime = new Date()
        const elapsedMs = Math.max(0, currentTime.getTime() - startTime.getTime())
        const elapsedSeconds = Math.floor(elapsedMs / 1000)
        
        // Calculate minutes and seconds
        const elapsedMinutes = Math.floor(elapsedSeconds / 60)
        const remainingSeconds = elapsedSeconds % 60
        
        console.log('⏱️  Calculated elapsed time:', {
          startTime: startTime.toISOString(),
          currentTime: currentTime.toISOString(),
          elapsedMs,
          elapsedSeconds,
          elapsedMinutes,
          remainingSeconds
        })
        
        // Set timing to true BEFORE starting timer
        timing.value = true
        
        // Start the timer with the elapsed time
        console.log(`🎬 About to call startTimer(${elapsedMinutes}, ${remainingSeconds})`)
        startTimer(elapsedMinutes, remainingSeconds)
        
        console.log(`✅ Auto-resumed timer for ${inProgressAppointment.patient?.first_name} ${inProgressAppointment.patient?.last_name}`)
        console.log(`⏱️  Final state: minutes=${timerMinutes.value}, seconds=${timerSeconds.value}, timing=${timing.value}`)
      }
      
    } else if (timing.value && !inProgressAppointment) {
      // No in-progress appointment found but timer is running - stop it
      console.log('⚠️  Stopping timer - no in-progress appointment found')
      timing.value = false
      stopTimer()
      activeAppointment.value = null
    }
    // Sort queue by order
    const appointmentOrder = response.appointment_order || []
    queueAppointments.value.sort((a, b) => {
      const aIndex = appointmentOrder.indexOf(a.id)
      const bIndex = appointmentOrder.indexOf(b.id)
      if (aIndex === -1) return 1
      if (bIndex === -1) return -1
      return aIndex - bIndex
    })
    
  } catch (err) {
    if (err.status === 404) {
      queueAppointments.value = []
      timelineAppointments.value = []
    } else {
      error.value = 'Could not fetch appointments'
    }
  }
}

// Patient Management Functions
const searchPatients = () => {
  if (!patientSearchQuery.value) {
    filteredPatients.value = []
    return
  }
  
  const query = patientSearchQuery.value.toLowerCase()
  filteredPatients.value = allPatientsCache.value.filter(patient => {
    const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase()
    const phone = (patient.phone || '').toLowerCase()
    const email = (patient.email || '').toLowerCase()
    return fullName.includes(query) || phone.includes(query) || email.includes(query)
  })
}

const selectPatientForAdd = (patient) => {
  selectedPatientForAdd.value = patient
  patientSearchQuery.value = `${patient.first_name} ${patient.last_name}`
  showPatientDropdown.value = false
  formError.value = null
}

const clearSelectedPatient = () => {
  selectedPatientForAdd.value = null
  patientSearchQuery.value = ''
  showPatientDropdown.value = false
  formError.value = null
}

const addPatientToQueue = async () => {
  if (!selectedPatientForAdd.value) {
    formError.value = 'Please select a patient'
    return
  }
  
  try {
    clearMessages()
    formError.value = null
    
    const appointmentData = {
      patient_id: selectedPatientForAdd.value.id,
      target_date: selectedDate.value,
      treatment: appointmentReason.value || '',
      reason: appointmentReason.value || '',
      duration: selectedDuration.value.value,
      status: 'pending'
    }
    
    const response = await makeApiCall('POST', '/appointments', appointmentData)
    
    successMessage.value = `${selectedPatientForAdd.value.first_name} ${selectedPatientForAdd.value.last_name} added to queue`
    setTimeout(() => successMessage.value = null, 3000)
    
    // Clear form
    clearSelectedPatient()
    appointmentReason.value = ''
    selectedDuration.value = { label: '30min', value: 30 }
    
    // Refresh schedule
    await fetchDailySchedule()
    
  } catch (err) {
    formError.value = 'Failed to add patient to queue'
    error.value = err.data?.error || 'Failed to create appointment'
  }
}

const selectAppointment = (appointment) => {
  selectedAppointment.value = appointment
}

// Enhanced Timer Functions with auto-sync capability
const startTimer = (resumeFromMinutes = 0, resumeFromSeconds = 0) => {
  console.log('🎬 startTimer called with:', { resumeFromMinutes, resumeFromSeconds })
  
  // Clear any existing timer
  if (timerInterval.value) {
    console.log('⚠️ Clearing existing timer interval')
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
  
  // Set initial timer values (either resume from elapsed time or start from 0)
  timerMinutes.value = resumeFromMinutes
  timerSeconds.value = resumeFromSeconds
  
  console.log(`🚀 Timer started at ${timerMinutes.value}:${timerSeconds.value.toString().padStart(2, '0')}`)
  
  // Start the interval to increment every second
  timerInterval.value = setInterval(() => {
    timerSeconds.value++
    if (timerSeconds.value >= 60) {
      timerMinutes.value++
      timerSeconds.value = 0
    }
    
    // Periodic sync check every 60 seconds to prevent drift
    if (timerSeconds.value === 0 && timerMinutes.value % 1 === 0 && activeAppointment.value?.actual_start_at) {
      syncTimerWithBackend()
    }
  }, 1000)
  
  console.log('✅ Timer interval created, ID:', timerInterval.value)
}

// Sync timer with backend to prevent drift during long sessions
const syncTimerWithBackend = () => {
  if (!activeAppointment.value?.actual_start_at) return
  
  const startTime = new Date(activeAppointment.value.actual_start_at)
  const currentTime = new Date()
  const elapsedMs = Math.max(0, currentTime.getTime() - startTime.getTime())
  const elapsedSeconds = Math.floor(elapsedMs / 1000)
  
  const correctMinutes = Math.floor(elapsedSeconds / 60)
  const correctSeconds = elapsedSeconds % 60
  
  // Only adjust if there's significant drift (>5 seconds)
  const currentTotal = timerMinutes.value * 60 + timerSeconds.value
  const correctTotal = correctMinutes * 60 + correctSeconds
  
  if (Math.abs(currentTotal - correctTotal) > 5) {
    timerMinutes.value = correctMinutes
    timerSeconds.value = correctSeconds
    console.log(`Timer synced: adjusted to ${correctMinutes}:${correctSeconds.toString().padStart(2, '0')}`)
  }
}

const stopTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
  return timerMinutes.value + Math.ceil(timerSeconds.value / 60)
}

// Appointment Management
const startAppointment = async (appointment) => {
  try {
    clearMessages()
    // Prevent starting a completed appointment
    if (appointment.status === 'completed') {
      return
    }

    // If this appointment is currently active, treat as stop
    if (timing.value && activeAppointment.value?.id === appointment.id) {
      await completeAppointment()
      return
    }

    // If another appointment is active, stop it before continuing
    if (timing.value && activeAppointment.value && activeAppointment.value.id !== appointment.id) {
      await completeAppointment()
    }

    const alreadyInProgress = (appointment.status === 'in-progress' || appointment.status === 'started') &&
      appointment.actual_start_at

    if (alreadyInProgress) {
      const resumeSource = timelineAppointments.value.find(a => a.id === appointment.id) || appointment
      const updated = { ...resumeSource, status: 'in-progress', actual_end_at: null }
      activeAppointment.value = updated

      const tIdx = timelineAppointments.value.findIndex(a => a.id === appointment.id)
      if (tIdx === -1) {
        timelineAppointments.value.push(updated)
      } else {
        timelineAppointments.value[tIdx] = { ...timelineAppointments.value[tIdx], ...updated }
      }

      const qIdx = queueAppointments.value.findIndex(a => a.id === appointment.id)
      if (qIdx !== -1) {
        queueAppointments.value[qIdx] = { ...queueAppointments.value[qIdx], ...updated }
      }

      const startTime = new Date(updated.actual_start_at)
      const now = new Date()
      const elapsedMs = Math.max(0, now.getTime() - startTime.getTime())
      const elapsedSeconds = Math.floor(elapsedMs / 1000)
      const elapsedMinutes = Math.floor(elapsedSeconds / 60)
      const remainingSeconds = elapsedSeconds % 60

      timing.value = true
      console.log(`🔁 Resuming appointment ${appointment.id} from elapsed ${elapsedMinutes}m ${remainingSeconds}s`)
      startTimer(elapsedMinutes, remainingSeconds)

      successMessage.value = `Resumed treatment for ${appointment.patient.first_name} ${appointment.patient.last_name}`
      setTimeout(() => successMessage.value = null, 3000)
      return
    }

    // Determine current time as actual start immediately for responsive UI
    const nowIso = new Date().toISOString()
    const timezone_offset = new Date().getTimezoneOffset() * -1
    // Optimistically set locally so the card moves right away
    const updated = { ...appointment, actual_start_at: nowIso, status: 'in-progress' }
    // Reflect in both active state and the timeline list
    activeAppointment.value = updated
    // Ensure the appointment exists on the timeline; if not, add it
    const idx = timelineAppointments.value.findIndex(a => a.id === appointment.id)
    if (idx === -1) {
      timelineAppointments.value.push(updated)
    } else {
      timelineAppointments.value[idx] = { ...timelineAppointments.value[idx], ...updated }
    }
    // Also update the queue reference
    const qIdx = queueAppointments.value.findIndex(a => a.id === appointment.id)
    if (qIdx !== -1) {
      queueAppointments.value[qIdx] = { ...queueAppointments.value[qIdx], ...updated }
    }
    // Notify backend (non-blocking) but await to keep state consistent
    const response = await makeApiCall('POST', `/appointments/${appointment.id}/start`, {
      timezone_offset,
      actual_start_at: nowIso
    })
    // If backend returns canonical values, merge them back
    if (response) {
      const merged = { ...updated, ...response }
      if (merged.status === 'in-progress' || merged.status === 'started') {
        merged.actual_end_at = null
      }
      activeAppointment.value = merged
      const t2 = timelineAppointments.value.findIndex(a => a.id === appointment.id)
      if (t2 !== -1) timelineAppointments.value[t2] = { ...timelineAppointments.value[t2], ...merged }
      const q2 = queueAppointments.value.findIndex(a => a.id === appointment.id)
      if (q2 !== -1) queueAppointments.value[q2] = { ...queueAppointments.value[q2], ...merged }
    }
    // Start timer from 0 for new appointments
    timing.value = true
    console.log('🆕 Starting new appointment, calling startTimer(0, 0)')
    startTimer(0, 0)

    successMessage.value = `Treatment started for ${appointment.patient.first_name} ${appointment.patient.last_name}`
    setTimeout(() => successMessage.value = null, 3000)
    // Re-sort/layout happens via computed props; optionally refresh later
    // await fetchDailySchedule()

  } catch (err) {
    error.value = 'Failed to start appointment'
  }
}

const completeAppointment = async () => {
  if (!activeAppointment.value) return
  
  try {
    clearMessages()
    // Use final complete endpoint with explicit end time now
    const nowIso = new Date().toISOString()
    const response = await makeApiCall('POST', `/appointments/${activeAppointment.value.id}/complete-timeline`, {
      actual_end_at: nowIso
    })
    
    const duration = stopTimer()
    timing.value = false
    
    successMessage.value = `Treatment completed for ${activeAppointment.value.patient.first_name} ${activeAppointment.value.patient.last_name} (${duration} minutes)`
    setTimeout(() => successMessage.value = null, 3000)
    
    // Merge completion into local lists to update position/height/duration immediately
    const id = activeAppointment.value.id
    const tIdx = timelineAppointments.value.findIndex(a => a.id === id)
    if (tIdx !== -1) {
      timelineAppointments.value[tIdx] = {
        ...timelineAppointments.value[tIdx],
        actual_end_at: response?.actual_end_at || nowIso,
        status: 'completed'
      }
    }
    const qIdx = queueAppointments.value.findIndex(a => a.id === id)
    if (qIdx !== -1) {
      queueAppointments.value[qIdx] = {
        ...queueAppointments.value[qIdx],
        actual_end_at: response?.actual_end_at || nowIso,
        status: 'completed'
      }
    }
    activeAppointment.value = null
    // Optionally fetch for server truth after latency
    // await fetchDailySchedule()
    
  } catch (err) {
    console.error('Error completing appointment:', err)
    error.value = err.data?.error || 'Failed to complete appointment'
  }
}

// FIXED: Drag and Drop Functions
const startDrag = (event, appointment) => {
  draggedItem.value = appointment
  isDragging.value = true
  
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  
  const startTime = `${currentHour}:${currentMinute.toString().padStart(2, '0')}`
  const endMinutes = currentHour * 60 + currentMinute + (appointment.duration || 30)
  const endHour = Math.floor(endMinutes / 60)
  const endMin = endMinutes % 60
  const endTime = `${endHour}:${endMin.toString().padStart(2, '0')}`
  
  dragPreview.value = {
    visible: true,
    x: event.clientX + 15,
    y: event.clientY - 15,
    timeRange: `${startTime} - ${endTime}`,
    patientName: `${appointment.patient.first_name} ${appointment.patient.last_name}`,
    duration: appointment.duration || 30
  }
  
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', appointment.id.toString())
}

const handleDragOver = (event) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
  isDragOver.value = true
  
  if (draggedItem.value) {
    const dropMinutes = calculateDropPosition(event)
    const startHour = Math.floor(dropMinutes / 60)
    const startMin = dropMinutes % 60
    const endMinutes = dropMinutes + (draggedItem.value.duration || 30)
    const endHour = Math.floor(endMinutes / 60)
    const endMin = endMinutes % 60
    const startPeriod = startHour >= 12 ? 'PM' : 'AM'
    const endPeriod = endHour >= 12 ? 'PM' : 'AM'
    const displayStartHour = startHour > 12 ? startHour - 12 : startHour === 0 ? 12 : startHour
    const displayEndHour = endHour > 12 ? endHour - 12 : endHour === 0 ? 12 : endHour
    const startTime = `${displayStartHour}:${startMin.toString().padStart(2, '0')} ${startPeriod}`
    const endTime = `${displayEndHour}:${endMin.toString().padStart(2, '0')} ${endPeriod}`
    dragPreview.value.timeRange = `${startTime} - ${endTime}`
    // Update drop indicator position and label (add scrollTop for zoomed/scrollable)
    const rect = timelineContainer.value?.getBoundingClientRect()
    const scrollTop = timelineContainer.value?.scrollTop || 0
    const y = event.clientY - (rect?.top || 0) - 8 + scrollTop
    dropIndicator.value.top = Math.max(0, y)
    dropIndicator.value.label = `${startTime}`
    dropIndicator.value.visible = true
  }
}

const handleDragLeave = (event) => {
  // Only set to false if we're actually leaving the timeline container
  if (!timelineContainer.value?.contains(event.relatedTarget)) {
    isDragOver.value = false
    dropIndicator.value.visible = false
  }
}

const handleDrop = async (event) => {
  event.preventDefault()
  isDragOver.value = false
  isDragging.value = false
  
  // Capture the dragged item locally to avoid race with dragend clearing global state
  const item = draggedItem.value
  if (!item) return
  
  try {
    clearMessages()
    
    const dropMinutes = calculateDropPosition(event)
    const dropTime = new Date(selectedDate.value)
    dropTime.setHours(Math.floor(dropMinutes / 60))
    dropTime.setMinutes(dropMinutes % 60)
    dropTime.setSeconds(0)
    dropTime.setMilliseconds(0)

    // Build a local datetime string without timezone to avoid server shifting time
    const toLocalSql = (d) => {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const hh = String(d.getHours()).padStart(2, '0')
      const mm = String(d.getMinutes()).padStart(2, '0')
      const ss = '00'
      return `${y}-${m}-${day} ${hh}:${mm}:${ss}`
    }
    const approximate_time = toLocalSql(dropTime)
    
    console.log('Dropping appointment at:', dropTime.toISOString())
    
    const response = await makeApiCall('PUT', `/appointments/${item.id}/set-timeline-time`, {
      approximate_time
    })
    
    const startHour = Math.floor(dropMinutes / 60)
    const startMin = dropMinutes % 60
    const period = startHour >= 12 ? 'PM' : 'AM'
    const displayHour = startHour > 12 ? startHour - 12 : startHour === 0 ? 12 : startHour
    const timeString = `${displayHour}:${startMin.toString().padStart(2, '0')} ${period}`
    
    const first = item.patient?.first_name || 'Patient'
    const last = item.patient?.last_name || ''
    successMessage.value = `${first} ${last}`.trim() + ` scheduled for ${timeString}`
    setTimeout(() => successMessage.value = null, 3000)
    
    await fetchDailySchedule()
    
  } catch (err) {
    console.error('Drop error:', err)
    error.value = err.data?.error || 'Failed to schedule appointment'
  } finally {
    draggedItem.value = null
    dragPreview.value.visible = false
    dropIndicator.value.visible = false
  }
}

// Queue reordering functions
const startQueueDrag = (event, appointment, index) => {
  // Setup queue reordering state
  queueDragState.value = {
    draggedIndex: index,
    draggedItem: appointment,
    isDragging: true
  }

  // Also set up cross-area drag (to timeline) so dropping on timeline works
  draggedItem.value = appointment
  isDragging.value = true

  // Initialize drag preview similar to timeline drag
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const startTime = `${currentHour}:${currentMinute.toString().padStart(2, '0')}`
  const endMinutes = currentHour * 60 + currentMinute + (appointment.duration || 30)
  const endHour = Math.floor(endMinutes / 60)
  const endMin = endMinutes % 60
  const endTime = `${endHour}:${endMin.toString().padStart(2, '0')}`
  dragPreview.value = {
    visible: true,
    x: event.clientX + 15,
    y: event.clientY - 15,
    timeRange: `${startTime} - ${endTime}`,
    patientName: `${appointment.patient.first_name} ${appointment.patient.last_name}`,
    duration: appointment.duration || 30
  }

  event.dataTransfer.effectAllowed = 'move'
}

const endQueueDrag = () => {
  queueDragState.value = {
    draggedIndex: -1,
    draggedItem: null,
    isDragging: false
  }
  dragDropIndicator.value.visible = false
  // Clear cross-area drag state
  draggedItem.value = null
  isDragging.value = false
  dragPreview.value.visible = false
}

const handleQueueDragOver = (event) => {
  event.preventDefault()
  if (!queueDragState.value.isDragging) return

  const container = event.currentTarget
  const items = container.getElementsByClassName('queue-item')
  const draggedIndex = queueDragState.value.draggedIndex
  
  let targetIndex = -1
  
  // Find the target index based on mouse position
  const mouseY = event.clientY
  Array.from(items).forEach((item, index) => {
    const rect = item.getBoundingClientRect()
    const midPoint = rect.top + rect.height / 2
    if (mouseY < midPoint && targetIndex === -1) {
      targetIndex = index
    }
  })
  
  if (targetIndex === -1) {
    targetIndex = items.length
  }
  
  // Don't show indicator if same position
  if (targetIndex !== draggedIndex && targetIndex !== draggedIndex + 1) {
    dragDropIndicator.value = {
      visible: true,
      position: targetIndex
    }
  } else {
    dragDropIndicator.value.visible = false
  }
}
 

// Queue Drag and Drop Functions for Reordering
 
 
 
const handleQueueDrop = async (event) => {
  event.preventDefault()
  
  if (!queueDragState.value.isDragging) return
  
  try {
    const container = event.currentTarget
    const rect = container.getBoundingClientRect()
    const y = event.clientY - rect.top
    
    // Find the position to insert
    const items = container.querySelectorAll('.queue-item')
    let newPosition = 0
    
    for (let i = 0; i < items.length; i++) {
      const itemRect = items[i].getBoundingClientRect()
      const itemY = itemRect.top - rect.top + itemRect.height / 2
      
      if (y < itemY) {
        newPosition = i
        break
      }
      newPosition = i + 1
    }
    
    const oldIndex = queueDragState.value.draggedIndex
    
    // Don't do anything if dropping in same position
    if (newPosition === oldIndex || newPosition === oldIndex + 1) {
      endQueueDrag()
      return
    }
    
    // Calculate the actual array position (account for removed item)
    const targetIndex = newPosition > oldIndex ? newPosition - 1 : newPosition
    
    // Create new order array
    const newOrder = [...queueAppointments.value]
    const [movedItem] = newOrder.splice(oldIndex, 1)
    newOrder.splice(targetIndex, 0, movedItem)
    
    // Update UI immediately (optimistic)
    queueAppointments.value = newOrder
    
    // Save to server using the reorder API
    const appointmentOrder = newOrder.map(apt => apt.id)
    await makeApiCall('POST', `/daily-schedule`, {
      schedule_date: selectedDate.value,
      appointment_order: appointmentOrder
    })
    
    successMessage.value = `Moved ${movedItem.patient.first_name} ${movedItem.patient.last_name} to position ${targetIndex + 1}`
    setTimeout(() => successMessage.value = null, 2000)
    
    // Refresh to ensure consistency
    await fetchDailySchedule()
    
  } catch (err) {
    console.error('Error reordering queue:', err)
    error.value = err.data?.error || err.message || 'Failed to reorder appointment'
    // Revert optimistic UI on failure
    await fetchDailySchedule()
  } finally {
    endQueueDrag()
  }
}

// Queue Management - FIXED WITH DEBUG AND IMPROVED REORDER
const reorderInQueue = async (appointmentId, direction) => {
  try {
    clearMessages()
    console.log('Reordering appointment:', appointmentId, 'direction:', direction)
    
    const currentIndex = queueAppointments.value.findIndex(apt => apt.id === appointmentId)
    if (currentIndex === -1) {
      console.error('Appointment not found in queue')
      return
    }
    
    let newIndex
    if (direction === 'up' && currentIndex > 0) {
      newIndex = currentIndex - 1
    } else if (direction === 'down' && currentIndex < queueAppointments.value.length - 1) {
      newIndex = currentIndex + 1
    } else {
      console.log('No reordering needed')
      return // No change needed
    }
    
    console.log('Moving from index', currentIndex, 'to index', newIndex)
    
    // Create new order array (optimistic UI)
    const prevOrder = [...queueAppointments.value]
    const newOrder = [...queueAppointments.value]
    const [movedItem] = newOrder.splice(currentIndex, 1)
    newOrder.splice(newIndex, 0, movedItem)
    
    // Update UI immediately (optimistic)
    queueAppointments.value = newOrder
    
    // Extract appointment IDs in new order for API
    const appointmentOrder = newOrder.map(apt => apt.id)
    console.log('New appointment order:', appointmentOrder)
    
    // Save to server
    await makeApiCall('POST', `/daily-schedule`, {
      schedule_date: selectedDate.value,
      appointment_order: appointmentOrder
    })
    
    successMessage.value = `Moved ${movedItem.patient.first_name} ${movedItem.patient.last_name} ${direction}`
    setTimeout(() => successMessage.value = null, 2000)
    
    // Refresh to ensure consistency
    await fetchDailySchedule()
    
  } catch (err) {
    console.error('Error reordering queue:', err)
    error.value = err.data?.error || err.message || 'Failed to reorder appointment'
    // revert optimistic UI on failure
    await fetchDailySchedule()
  }
}

const removeFromQueue = async (appointmentId) => {
  if (!confirm('Remove this appointment from queue?')) return
  
  try {
    await makeApiCall('DELETE', `/appointments/${appointmentId}/remove-from-queue`)
    
    successMessage.value = 'Appointment removed from queue'
    setTimeout(() => successMessage.value = null, 3000)
    
    await fetchDailySchedule()
    
  } catch (err) {
    error.value = 'Failed to remove appointment'
  }
}

const removeFromTimeline = async (appointmentId) => {
  if (!confirm('Remove this appointment from timeline?')) return
  
  try {
    await makeApiCall('DELETE', `/appointments/${appointmentId}/remove-from-timeline`)
    
    successMessage.value = 'Appointment removed from timeline'
    setTimeout(() => successMessage.value = null, 3000)
    
    await fetchDailySchedule()
    
  } catch (err) {
    error.value = 'Failed to remove from timeline'
  }
}

const deleteAppointment = async (appointmentId) => {
  if (!confirm('Delete this appointment permanently?')) return
  try {
    // If currently timing this appointment, stop timer and reset state
    if (activeAppointment.value?.id === appointmentId && timing.value) {
      stopTimer()
      timing.value = false
      activeAppointment.value = null
    }
    await makeApiCall('DELETE', `/appointments/${appointmentId}`)
    successMessage.value = 'Appointment deleted'
    setTimeout(() => successMessage.value = null, 2000)
    await fetchDailySchedule()
  } catch (err) {
    error.value = err.data?.error || 'Failed to delete appointment'
  }
}

// Move item to top/bottom in queue and persist - IMPROVED
const moveToTop = async (appointmentId) => {
  try {
    const idx = queueAppointments.value.findIndex(a => a.id === appointmentId)
    if (idx <= 0) return
    
    const newOrder = [...queueAppointments.value]
    const [item] = newOrder.splice(idx, 1)
    newOrder.unshift(item)
    
    // Update UI immediately (optimistic)
    queueAppointments.value = newOrder
    
    await makeApiCall('POST', `/daily-schedule`, {
      schedule_date: selectedDate.value,
      appointment_order: newOrder.map(a => a.id)
    })
    
    successMessage.value = `Moved ${item.patient.first_name} to top`
    setTimeout(() => successMessage.value = null, 2000)
    
    await fetchDailySchedule()
  } catch (err) {
    error.value = 'Failed to move to top'
    await fetchDailySchedule() // revert on error
  }
}

const moveToBottom = async (appointmentId) => {
  try {
    const idx = queueAppointments.value.findIndex(a => a.id === appointmentId)
    if (idx === -1 || idx === queueAppointments.value.length - 1) return
    
    const newOrder = [...queueAppointments.value]
    const [item] = newOrder.splice(idx, 1)
    newOrder.push(item)
    
    // Update UI immediately (optimistic)
    queueAppointments.value = newOrder
    
    await makeApiCall('POST', `/daily-schedule`, {
      schedule_date: selectedDate.value,
      appointment_order: newOrder.map(a => a.id)
    })
    
    successMessage.value = `Moved ${item.patient.first_name} to bottom`
    setTimeout(() => successMessage.value = null, 2000)
    
    await fetchDailySchedule()
  } catch (err) {
    error.value = 'Failed to move to bottom'
    await fetchDailySchedule() // revert on error
  }
}

// Time Edit Functions
const showTimeEditModal = (appointment) => {
  let startTime = ''
  let endTime = ''
  
  if (appointment.actual_start_at) {
    const start = new Date(appointment.actual_start_at)
    startTime = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`
  }
  
  if (appointment.actual_end_at) {
    const end = new Date(appointment.actual_end_at)
    endTime = `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`
  }
  
  timeEditModal.value = {
    visible: true,
    appointment: appointment,
    startTime: startTime,
    endTime: endTime
  }
}

const hideTimeEditModal = () => {
  timeEditModal.value = {
    visible: false,
    appointment: null,
    startTime: '',
    endTime: ''
  }
}

const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 0
  
  const [startHours, startMinutes] = startTime.split(':').map(Number)
  const [endHours, endMinutes] = endTime.split(':').map(Number)
  
  const startTotalMinutes = startHours * 60 + startMinutes
  const endTotalMinutes = endHours * 60 + endMinutes
  
  return endTotalMinutes - startTotalMinutes
}

const saveManualTimes = async () => {
  if (!timeEditModal.value.appointment || !timeEditModal.value.startTime || !timeEditModal.value.endTime) {
    return
  }
  
  try {
    clearMessages()
    
    const startDate = new Date(`${selectedDate.value}T${timeEditModal.value.startTime}:00`)
    const endDate = new Date(`${selectedDate.value}T${timeEditModal.value.endTime}:00`)
    
    if (endDate <= startDate) {
      error.value = 'End time must be after start time'
      return
    }
    
    await makeApiCall('PUT', `/appointments/${timeEditModal.value.appointment.id}/edit-times`, {
      actual_start_at: startDate.toISOString(),
      actual_end_at: endDate.toISOString()
    })
    
    const durationMinutes = Math.round((endDate - startDate) / 60000)
    successMessage.value = `Times updated: ${durationMinutes} minutes`
    setTimeout(() => successMessage.value = null, 3000)
    
    hideTimeEditModal()
    await fetchDailySchedule()
    
  } catch (err) {
    error.value = 'Failed to save times'
  }
}

// Mouse event handlers for drag preview
const handleMouseMove = (event) => {
  if (isDragging.value && draggedItem.value) {
    dragPreview.value.x = event.clientX + 15
    dragPreview.value.y = event.clientY - 15
  }
}

const navigateToCreatePatient = () => {
  const searchQuery = patientSearchQuery.value
  navigateTo(`/patients?prefill=${encodeURIComponent(searchQuery)}`)
}

// Add appointment to timeline at current time
const addToTimelineAtCurrentTime = async (appointment) => {
  try {
    clearMessages()
    
    // Calculate current time slot
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    
    // Snap to 15-minute intervals
    const snapInterval = 15
    const snappedMinutes = Math.round(currentMinutes / snapInterval) * snapInterval
    
    // Create a date object for the scheduled time
    const scheduleTime = new Date(selectedDate.value)
    scheduleTime.setHours(Math.floor(snappedMinutes / 60))
    scheduleTime.setMinutes(snappedMinutes % 60)
    scheduleTime.setSeconds(0)
    scheduleTime.setMilliseconds(0)
    
    // Build local datetime string
    const toLocalSql = (d) => {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const hh = String(d.getHours()).padStart(2, '0')
      const mm = String(d.getMinutes()).padStart(2, '0')
      const ss = '00'
      return `${y}-${m}-${day} ${hh}:${mm}:${ss}`
    }
    const approximate_time = toLocalSql(scheduleTime)
    
    await makeApiCall('PUT', `/appointments/${appointment.id}/set-timeline-time`, {
      approximate_time
    })
    
    const timeString = formatTime(scheduleTime.toISOString())
    successMessage.value = `${appointment.patient.first_name} ${appointment.patient.last_name} added to timeline at ${timeString}`
    setTimeout(() => successMessage.value = null, 3000)
    
    await fetchDailySchedule()
    
  } catch (err) {
    console.error('Error adding to timeline:', err)
    error.value = err.data?.error || 'Failed to add to timeline'
  }
}

// Click handlers to align with workflow
const handleQueueItemClick = async (appointment) => {
  // Only select the appointment, don't start timer automatically
  selectedAppointment.value = appointment
}

const handleTimelineCardClick = async (appointment) => {
  // Do not allow restarting a completed appointment via card click
  if (appointment.status === 'completed') {
    return
  }
  if (timing.value && activeAppointment.value?.id === appointment.id) {
    await completeAppointment()
  } else {
    await startAppointment(appointment)
  }
}

// Date navigation helpers
const setDateAndFetch = async (dateStr) => {
  selectedDate.value = dateStr
  await fetchDailySchedule(dateStr)
}
const goToPrevDay = async () => {
  const d = new Date(selectedDate.value)
  d.setDate(d.getDate() - 1)
  await setDateAndFetch(d.toISOString().split('T')[0])
}
const goToNextDay = async () => {
  const d = new Date(selectedDate.value)
  d.setDate(d.getDate() + 1)
  await setDateAndFetch(d.toISOString().split('T')[0])
}
const goToToday = async () => {
  await setDateAndFetch(new Date().toISOString().split('T')[0])
}
const onDateChange = async (e) => {
  const value = e.target.value
  if (value) await setDateAndFetch(value)
}

// Lifecycle hooks
onMounted(async () => {
  updateTime()
  const interval = setInterval(updateTime, 1000)
  document.addEventListener('mousemove', handleMouseMove)
  
  // Close dropdowns when clicking outside
  const handleClickOutside = (event) => {
    if (!event.target.closest('.relative')) {
      showPatientDropdown.value = false
    }
  }
  
  document.addEventListener('click', handleClickOutside)
  
  try {
    await fetchCurrentUser()
    await fetchPatients() 
    await fetchDailySchedule()
  } catch (err) {
    console.error('Error initializing:', err)
    error.value = 'Failed to load initial data'
  }
  
  onUnmounted(() => {
    clearInterval(interval)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('click', handleClickOutside)
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
    }
  })
})
</script>

<style scoped>
/* Enhanced Scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #cbd5e1, #94a3b8);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #94a3b8, #64748b);
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from, .slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.modal-enter-active, .modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.appointment-enter-active, .appointment-leave-active {
  transition: all 0.5s ease;
}

.appointment-enter-from, .appointment-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.queue-item-enter-active, .queue-item-leave-active {
  transition: all 0.4s ease;
}

.queue-item-enter-from, .queue-item-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.appointment-move {
  transition: transform 0.5s ease;
}

.queue-item-move {
  transition: transform 0.4s ease;
}

/* Normalize date input in the header controls for perfect vertical alignment */
.date-input::-webkit-calendar-picker-indicator {
  filter: invert(1) opacity(0.8);
}
.date-input {
  line-height: 1; /* avoid extra vertical padding in some browsers */
}

/* Drag and drop styles */
.timeline-scrollable {
  max-height: 700px;
  min-height: 80vh;
  overflow-y: auto;
}
.timeline-autoheight {
  min-height: 80vh;
  max-height: none;
  overflow-y: visible;
}

/* Green background for timeline appointments in queue */
.bg-green-25 {
  background-color: rgba(34, 197, 94, 0.05);
}

/* Green background for timeline appointments in queue */
.bg-green-25 {
  background-color: rgba(34, 197, 94, 0.05);
}

.bg-green-50 {
  background-color: rgba(34, 197, 94, 0.1);
}

.bg-slate-25 {
  background-color: rgba(148, 163, 184, 0.05);
}

/* Custom timeline grid */
.timeline-grid {
  background-image: 
    linear-gradient(to bottom, #e2e8f0 1px, transparent 1px);
  /* background-size is driven inline via :style using pixelsPerHour */
}

/* Appointment card hover effects */
.appointment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Queue item drag cursor */
.queue-item {
  cursor: grab;
  transition: all 0.2s ease;
}

.queue-item:active {
  cursor: grabbing;
}

/* Compact appointment override: make the card height driven by content/font-size */
.compact-appointment {
  height: auto !important;      /* ignore inline top/height where appropriate */
  min-height: 2rem;         /* minimal visible height (increased from 1.25rem to 2rem) */
  padding-top: 0.25rem !important;
  padding-bottom: 0.25rem !important;
  display: flex;
  align-items: center;
}

.compact-appointment .flex { /* ensure inner flex doesn't grow the card */
  align-items: center;
}

.queue-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Enhanced queue styling */
.queue-item.group {
  position: relative;
}

.queue-item.group::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: transparent;
  transition: all 0.2s ease;
  border-radius: 0 3px 3px 0;
}

.queue-item.group:hover::before {
  background: linear-gradient(to bottom, #3b82f6, #1d4ed8);
}

/* Timeline scheduled items accent */
.queue-item.border-green-300::before {
  background: linear-gradient(to bottom, #10b981, #059669) !important;
}

/* Active treatment glow */
.queue-item:has(.bg-red-100) {
  animation: pulse-glow 2s infinite;
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 5px rgba(239, 68, 68, 0.3); }
  50% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.5); }
}

/* Timeline drop zone */
.timeline-drop-zone {
  transition: all 0.3s ease;
}

.timeline-drop-zone.drag-over {
  background: linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 197, 253, 0.1));
  border-color: #3b82f6;
}

/* Status indicators */
.status-dot {
  transition: all 0.3s ease;
}

.status-dot.online {
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
}

/* Enhanced button hover effects */
.queue-item button {
  transition: all 0.15s ease;
}

.queue-item button:hover {
  transform: scale(1.1);
}

/* Better mobile responsiveness */
@media (max-width: 1024px) {
  .timeline-container {
    min-height: 500px;
    overflow-y: auto;
  }
  
  .appointment-card {
    padding: 12px;
  }
  
  .queue-item {
    padding: 8px;
  }
}

/* Overlap popover tweaks */
.overlap-popover {
  pointer-events: auto;
}

@media (max-width: 768px) {
  .grid-cols-4 {
    grid-template-columns: 1fr;
  }
  
  .timeline-container {
    min-height: 400px;
  }
  
  .queue-item {
    padding: 6px;
  }
  
  .queue-item .text-sm {
    font-size: 0.75rem;
  }
}
</style>



///done 
