<template>
  <div class="record-detail-view-redesigned relative">
    <!-- Close Button - Fixed Position Top Right -->
    <button @click="handleBackClick" class="btn btn-close fixed top-6 right-6 z-50 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl">
      <X size="20" />
    </button>

    <!--
      FIX: Added v-if="formData" to prevent rendering before the formData object is initialized.
      This resolves the "Cannot read properties of undefined (reading 'treatments')" error.
    -->
    <div v-if="formData" class="layout-container">
      <!-- Main Content -->
      <div class="main-content">
        <form @submit.prevent="handleSubmit" class="content-sections">
          
          <!-- Section 1: Basic Information -->
          <section id="basic-info" class="content-section">
            <div class="section-header">
              <div class="section-icon">
                <FileText size="24" />
              </div>
              <div class="section-title-area">
                <h2 class="section-title">Basic Information</h2>
                <p class="section-description">Select treatment type and enter basic record details</p>
              </div>
              <div v-if="formData.treatments && formData.treatments.length > 0" class="overall-progress">
                <div class="progress-circle">
                  <svg width="60" height="60" viewBox="0 0 60 60" class="progress-ring">
                    <circle cx="30" cy="30" r="25" fill="none" stroke="#e2e8f0" stroke-width="4"/>
                    <circle cx="30" cy="30" r="25" fill="none" stroke="#3b82f6" stroke-width="4"
                            :stroke-dasharray="157" 
                            :stroke-dashoffset="157 - (157 * overallProgress / 100)"
                            class="progress-ring-fill"/>
                  </svg>
                  <div class="progress-text-overlay">{{ Math.round(overallProgress) }}%</div>
                </div>
                <div class="progress-label">Overall Progress</div>
              </div>
            </div>
            
            <div class="section-content">
              <div class="basic-info-grid">
                <!-- Treatment Type Selection -->
                <div class="form-group treatment-type-group">
                  <label class="form-label required">Treatment Type</label>
                  <div class="treatment-type-options">
                    <button 
                      @click.prevent="selectTreatmentType('tooth')"
                      type="button"
                      :class="['treatment-type-option', { 'selected': treatmentType === 'tooth' }]"
                    >
                      <div class="option-icon">🦷</div>
                      <div class="option-content">
                        <div class="option-title">Tooth Treatment</div>
                        <div class="option-description">Treatment for specific tooth</div>
                      </div>
                    </button>
                    <button 
                      @click.prevent="selectTreatmentType('general')"
                      type="button"
                      :class="['treatment-type-option', { 'selected': treatmentType === 'general' }]"
                    >
                      <div class="option-icon">🏥</div>
                      <div class="option-content">
                        <div class="option-title">General Treatment</div>
                        <div class="option-description">Treatment not specific to a tooth</div>
                      </div>
                    </button>
                  </div>
                </div>

                <!-- Tooth Number or General Treatment Name -->
                <div class="form-group tooth-info-group">
                  <div v-if="treatmentType === 'tooth'" class="tooth-number-container">
                    <label for="tooth_number" class="form-label required">Tooth Number</label>
                    <div class="tooth-number-input-container">
                      <input 
                        type="number" 
                        id="tooth_number" 
                        v-model.number="formData.tooth_number" 
                        required 
                        :disabled="isEditing" 
                        class="form-input tooth-number-input" 
                        placeholder="e.g., 18"
                        min="1"
                        max="32"
                      >
                      <div class="tooth-number-dropdown">
                        <button type="button" class="dropdown-trigger">
                          <ChevronDown size="16" />
                        </button>
                      </div>
                    </div>
                    <p class="form-help">Enter dental chart number (1-32)</p>
                  </div>

                  <div v-if="treatmentType === 'general'" class="general-treatment-container">
                    <label for="general_condition" class="form-label required">Condition</label>
                    <div class="search-container">
                      <div class="search-input-wrapper">
                        <input 
                          type="text" 
                          id="general_condition" 
                          v-model="generalTreatmentName"
                          @input="onGeneralConditionInput"
                          @keydown="onGeneralConditionKeydown"
                          @focus="onGeneralConditionFocus"
                          @blur="onGeneralConditionBlur"
                          required 
                          class="condition-search-input" 
                          placeholder="e.g., Full Mouth Cleaning, Orthodontic Consultation, Teeth Whitening"
                          autocomplete="off"
                        />
                        <Search class="search-icon" :size="18" />
                      </div>
                      
                      <!-- Search Dropdown -->
                      <div v-if="showGeneralConditionDropdown" class="search-dropdown">
                        <div
                          v-for="(suggestion, index) in generalConditionSuggestions"
                          :key="suggestion.value + index"
                          :class="['search-dropdown-item', { 'focused': index === generalConditionFocusedIndex }]"
                          @mousedown.prevent="selectGeneralConditionSuggestion(suggestion)"
                          @mouseenter="generalConditionFocusedIndex = index"
                        >
                          <div class="dropdown-condition-info">
                            <div class="dropdown-condition-name">{{ suggestion.text }}</div>
                            <div class="dropdown-condition-description">{{ suggestion.category }}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p class="form-help">Enter the condition/treatment for this general record</p>
                  </div>
                </div>

                <!-- Record Status -->
                <div class="form-group status-group">
                  <label class="form-label required">Record Status</label>
                  <div class="status-options-grid">
                    <button 
                      v-for="status in statusOptions" 
                      :key="status.value"
                      @click="formData.status = status.value"
                      type="button"
                      :class="['status-option', { 'selected': formData.status === status.value }]"
                    >
                      <div class="status-icon-container">
                        <span class="status-icon">{{ getStatusIcon(status.value) }}</span>
                      </div>
                      <div class="status-label">{{ status.label }}</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Section 2: Tooth Condition -->
          <section id="condition" class="content-section" v-if="treatmentType === 'tooth'">
            <div class="section-header">
              <div class="section-icon">
                <Smile size="24" />
              </div>
              <div class="section-title-area">
                <h2 class="section-title">Tooth Condition</h2>
                <p class="section-description">Select the current condition of the tooth using visual indicators</p>
              </div>
              <!-- Search Bar -->
              <div class="condition-search-container">
                <div class="search-input-wrapper">
                  <Search size="20" class="search-icon" />
                  <input 
                    type="text" 
                    ref="searchInput"
                    v-model="conditionSearchQuery" 
                    placeholder="Search conditions..."
                    class="condition-search-input"
                    @focus="handleSearchFocus"
                    @blur="handleSearchBlur"
                    @input="handleSearchInput"
                  />
                  <!-- Search Dropdown -->
                  <div v-if="showSearchDropdown && searchDropdownConditions.length > 0" class="search-dropdown">
                    <div 
                      v-for="condition in searchDropdownConditions" 
                      :key="condition.value"
                      class="search-dropdown-item"
                      @mousedown.prevent="selectFromDropdown(condition)"
                    >
                      <img :src="condition.image" :alt="condition.label" class="dropdown-condition-image" />
                      <div class="dropdown-condition-info">
                        <div class="dropdown-condition-name">{{ condition.label }}</div>
                        <div class="dropdown-condition-description">{{ condition.shortDescription || condition.description }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="section-content">
              <div class="form-group">
                <label class="form-label required">Tooth Condition</label>
                
                <!-- All Conditions with Images -->
                <div class="condition-visual-grid">
                  <!-- Predefined Conditions -->
                  <button 
                    v-for="condition in predefinedConditionsWithImages" 
                    :key="condition.value"
                    @click="selectCondition(condition.value)" 
                    type="button" 
                    :class="['condition-card', { 'selected': formData.condition === condition.value }]"
                    :title="condition.label"
                    @mouseenter="showTooltip($event, condition.description || condition.label)"
                    @mouseleave="hideTooltip"
                  >
                    <img :src="condition.image" :alt="condition.label" class="tooth-icon-full" />
                  </button>
                  
                  <!-- Detailed Conditions -->
                  <button 
                    v-for="condition in filteredConditions" 
                    :key="condition.value"
                    @click="selectCondition(condition.value)" 
                    type="button" 
                    :class="['condition-card', { 'selected': formData.condition === condition.value }]"
                    :title="condition.label"
                    @mouseenter="showTooltip($event, condition.description)"
                    @mouseleave="hideTooltip"
                  >
                    <img :src="condition.image" :alt="condition.label" class="tooth-icon-full" />
                  </button>
                  
                  <!-- Other Condition Button -->
                  <button 
                    @click="selectCondition('other')" 
                    type="button" 
                    :class="['condition-card other-condition', { 'selected': formData.condition === 'other' }]"
                    title="Other"
                  >
                    <Plus size="40" class="other-icon-full" />
                  </button>
                </div>
              </div>
              
              <TransitionExpand>
                <div v-if="formData.condition === 'other'" class="form-group mt-4">
                  <label for="other_condition" class="form-label required">Specify Other Condition</label>
                  <div class="other-condition-search-container">
                    <div class="search-input-wrapper">
                      <input 
                        ref="otherConditionInput"
                        type="text" 
                        id="other_condition" 
                        v-model="otherConditionQuery"
                        @input="onOtherConditionInput"
                        @keydown="onOtherConditionKeydown"
                        @focus="onOtherConditionFocus"
                        @blur="onOtherConditionBlur"
                        required 
                        class="condition-search-input" 
                        placeholder="Search and describe the condition..."
                        autocomplete="off"
                      />
                      <Search class="search-icon" :size="18" />
                    </div>
                    
                    <!-- Search Dropdown -->
                    <div v-if="showOtherConditionDropdown" class="search-dropdown">
                      <div
                        v-for="(suggestion, index) in otherConditionSuggestions"
                        :key="suggestion.value + index"
                        :class="['search-dropdown-item', { 'focused': index === otherConditionFocusedIndex }]"
                        @mousedown.prevent="selectOtherConditionSuggestion(suggestion)"
                        @mouseenter="otherConditionFocusedIndex = index"
                      >
                        <div class="dropdown-condition-info">
                          <div class="dropdown-condition-name">{{ suggestion.text }}</div>
                          <div class="dropdown-condition-description">{{ suggestion.category }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TransitionExpand>
              
              <div class="form-group diagnosis-notes-group">
                <label for="diagnosis_notes" class="form-label">Diagnosis Notes</label>
                <textarea id="diagnosis_notes" v-model="formData.notes" rows="4" 
                          class="form-textarea" placeholder="Add detailed diagnosis notes..."></textarea>
              </div>
            </div>
          </section>

          <!-- Section 3: Treatment Plans -->
          <section id="treatments" class="content-section">
            <div class="section-header">
              <div class="section-icon">
                <ListChecks size="24" />
              </div>
              <div>
                <h2 class="section-title">Treatment Plans</h2>
                <p class="section-description">Add and manage treatment procedures</p>
              </div>
              <button type="button" @click="addTreatment" class="btn btn-primary">
                <PlusCircle size="16" class="mr-2" />
                Add Treatment
              </button>
            </div>
            
            <div class="section-content">
              <div v-if="!formData.treatments || formData.treatments.length === 0" class="empty-state">
                <Info size="48" class="empty-icon" />
                <h4 class="empty-title">No Treatments Added</h4>
                <p class="empty-description">Start by adding your first treatment plan.</p>
                <button type="button" @click="addTreatment" class="btn btn-primary">
                  <PlusCircle size="16" class="mr-2" />
                  Add First Treatment
                </button>
              </div>

              <TransitionGroup name="treatment-list" tag="div" class="treatments-list">
                <div v-for="(treatment, tIndex) in formData.treatments" :key="tIndex" class="treatment-card-new">
                  <div class="treatment-header-new">
                    <div class="treatment-number">{{ tIndex + 1 }}</div>
                    <div class="treatment-info-new">
                      <h4 class="treatment-title-new">{{ getActualTreatmentTitle(treatment) }}</h4>
                      <div class="treatment-meta">
                        <span class="treatment-type-badge">{{ getTypeBadge(treatment.treatment_type) }}</span>
                        <span v-if="treatment.cost" class="treatment-cost">{{ getCurrencySymbol(treatment.currency) }}{{ treatment.cost }}</span>
                      </div>
                    </div>
                    <div class="treatment-progress">
                      <div class="treatment-progress-circle">
                        <svg width="40" height="40" viewBox="0 0 40 40" class="progress-ring-small">
                          <circle cx="20" cy="20" r="16" fill="none" stroke="#e2e8f0" stroke-width="3"/>
                          <circle cx="20" cy="20" r="16" fill="none" stroke="#10b981" stroke-width="3"
                                  :stroke-dasharray="100" 
                                  :stroke-dashoffset="100 - (100 * getTreatmentProgress(treatment) / 100)"
                                  class="progress-ring-fill"/>
                        </svg>
                        <div class="progress-text-small">{{ Math.round(getTreatmentProgress(treatment)) }}%</div>
                      </div>
                    </div>
                    <div class="treatment-actions">
                      <button type="button" @click="toggleTreatmentExpanded(tIndex)" class="btn-icon">
                        <ChevronDown v-if="!treatment.expanded" size="16" />
                        <ChevronUp v-else size="16" />
                      </button>
                      <button type="button" @click="removeTreatment(tIndex)" class="btn-icon btn-danger">
                        <Trash2 size="16" />
                      </button>
                    </div>
                  </div>
                  
                  <TransitionExpand>
                    <div v-if="treatment.expanded !== false" class="treatment-content-new">
                      <div class="treatment-form-grid">
                        <div class="form-group">
                          <label class="form-label required">Treatment Type</label>
                          <select v-model="treatment.treatment_type" required class="form-select">
                            <option disabled value="">Select treatment type</option>
                            <option v-for="opt in treatmentSelectOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                          </select>
                        </div>
                        <div class="form-group">
                          <label class="form-label">Estimated Cost</label>
                          <div class="cost-input">
                            <select v-model="treatment.currency" class="currency-select">
                              <option>USD</option>
                              <option>EUR</option>
                              <option>GBP</option>
                              <option>INR</option>
                            </select>
                            <input type="number" v-model.number="treatment.cost" placeholder="0.00" 
                                   class="form-input cost-amount">
                          </div>
                        </div>
                      </div>
                      
                      <TransitionExpand>
                        <div v-if="treatment.treatment_type === 'other_treatment'" class="form-group">
                          <label class="form-label required">Specify Treatment</label>
                          <div class="treatment-name-input-container">
                            <input 
                              type="text" 
                              v-model="treatment.other_treatment_text" 
                              required 
                              class="form-input treatment-name-input"
                              placeholder="Type treatment name..."
                              @focus="showTreatmentSuggestions = true"
                              @blur="hideTreatmentSuggestionsDelayed"
                              @input="filterTreatmentSuggestions($event)"
                            >
                            
                            <!-- Treatment Suggestions Dropdown -->
                            <ul v-if="showTreatmentSuggestions && filteredTreatmentSuggestions.length > 0" 
                                class="treatment-suggestions-dropdown">
                              <li
                                v-for="(suggestion, index) in filteredTreatmentSuggestions"
                                :key="suggestion.value"
                                @mousedown.prevent="selectTreatmentSuggestion(treatment, suggestion.text)"
                                class="treatment-suggestion-item"
                              >
                                <span class="suggestion-text">{{ suggestion.text }}</span>
                                <span class="suggestion-category">{{ suggestion.category }}</span>
                              </li>
                            </ul>
                          </div>
                          <p class="form-helper-text">Describe the specific treatment or select from common procedures.</p>
                        </div>
                      </TransitionExpand>
                      
                      <!-- Suggested Treatment Steps -->
                      <TransitionExpand>
                        <div v-if="treatment.treatment_type && getSuggestedSteps(treatment.treatment_type).length > 0" class="form-group">
                          <label class="form-label">Suggested Treatment Steps</label>
                          <p class="form-helper-text">Click on individual steps to add as tags to your treatment steps.</p>
                          
                          <!-- Suggested Steps to Select -->
                          <div class="suggested-steps-container">
                            <button
                              v-for="suggestedStep in getSuggestedSteps(treatment.treatment_type)"
                              :key="suggestedStep"
                              @click="addStepTag(tIndex, suggestedStep)"
                              type="button"
                              class="suggested-step-tag"
                            >
                              <Plus size="12" class="mr-1" />
                              {{ formatStepName(suggestedStep) }}
                            </button>
                          </div>
                        </div>
                      </TransitionExpand>
                      
                      <!-- Treatment Steps -->
                      <div class="treatment-steps-new">
                        <div class="steps-header-new">
                          <h5 class="steps-title">Treatment Steps</h5>
                          <button type="button" @click="addStep(tIndex)" class="btn btn-secondary btn-sm">
                            <Plus size="14" class="mr-1" />
                            Add Step
                          </button>
                        </div>
                        
                        <TransitionGroup name="step-list" tag="div" class="steps-list-new">
                          <div v-for="(step, sIndex) in treatment.steps" :key="sIndex" 
                               :class="['step-item-new', { 'active-step': activeStep.treatmentIndex === tIndex && activeStep.stepIndex === sIndex }]">
                            <div :class="['step-indicator', { 'critical': step.is_critical }]">
                              {{ sIndex + 1 }}
                              <span v-if="step.is_critical" class="critical-badge">!</span>
                            </div>
                            <div class="step-content-new">
                              <div class="step-form">
                                <!-- Tag Suggestion Input for Step Description -->
                                <div class="form-group">
                                  <label class="form-label">Step Description & Tags</label>
                                  <TagSuggestionInput
                                    :ref="(el) => tagInputRefs[`${tIndex}-${sIndex}`] = el"
                                    v-model="step.tags"
                                    :suggestions="getStepSuggestions(treatment.treatment_type)"
                                    :predefined-tags="getSuggestedSteps(treatment.treatment_type)"
                                    placeholder="Add step description tags..."
                                    :allow-custom-tags="true"
                                    :show-predefined-tags="false"
                                    @tag-added="onStepTagAdded(tIndex, sIndex, $event)"
                                    @tag-removed="onStepTagRemoved(tIndex, sIndex, $event)"
                                    @input-changed="onTagInputChanged(tIndex, sIndex, $event)"
                                    @focus="setActiveStep(tIndex, sIndex)"
                                    @click="setActiveStep(tIndex, sIndex)"
                                  />
                                  <p class="form-helper-text">Add tags to describe this treatment step. You can select from suggestions or create custom tags.</p>
                                </div>
                                
                                <div class="step-details-row">
                                  <!-- Date Picker -->
                                  <div class="date-picker-container">
                                    <DatePicker v-model="step.step_date" placeholder="Select date" />
                                  </div>
                                  
                                  <!-- Critical Toggle and Days -->
                                  <div class="critical-section">
                                    <div class="critical-toggle">
                                      <label class="toggle-switch">
                                        <input 
                                          type="checkbox" 
                                          v-model="step.is_critical"
                                          @focus="setActiveStep(tIndex, sIndex)"
                                        >
                                        <span class="toggle-slider"></span>
                                      </label>
                                      <span class="toggle-label">Critical</span>
                                    </div>
                                    <div v-if="step.is_critical" class="days-input">
                                      <input 
                                        type="number" 
                                        v-model.number="step.days_to_complete"
                                        placeholder="Days"
                                        min="1"
                                        class="form-input days-field"
                                        @focus="setActiveStep(tIndex, sIndex)"
                                      >
                                      <span class="days-label">days</span>
                                    </div>
                                  </div>

                                  <!-- Follow-up Toggle and Options -->
                                  <div class="follow-up-section">
                                    <div class="follow-up-toggle">
                                      <label class="toggle-switch">
                                        <input 
                                          type="checkbox" 
                                          v-model="step.is_follow_up"
                                          @change="onFollowUpToggle(step)"
                                          @focus="setActiveStep(tIndex, sIndex)"
                                        >
                                        <span class="toggle-slider follow-up"></span>
                                      </label>
                                      <span class="toggle-label">Follow-up</span>
                                    </div>
                                    <div v-if="step.is_follow_up" class="follow-up-options">
                                      <select 
                                        v-model="step.follow_up_status"
                                        class="form-select follow-up-status"
                                        @focus="setActiveStep(tIndex, sIndex)"
                                      >
                                        <option value="pending" :selected="step.follow_up_status === 'pending'">Pending</option>
                                        <option value="completed" :selected="step.follow_up_status === 'completed'">Completed</option>
                                      </select>
                                    </div>
                                  </div>
                                  
                                  <!-- Status Badges -->
                                  <div class="step-status-badges">
                                    <button 
                                      v-for="sStatus in stepStatusOptions" 
                                      :key="sStatus.value"
                                      @click="step.status = sStatus.value; setActiveStep(tIndex, sIndex)"
                                      type="button"
                                      :class="['step-status-badge', { 'active': step.status === sStatus.value }]"
                                    >
                                      {{ getStatusBadgeIcon(sStatus.value) }} {{ sStatus.label }}
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <button type="button" @click="removeStep(tIndex, sIndex)" class="step-remove">
                                <X size="14" />
                              </button>
                            </div>
                          </div>
                        </TransitionGroup>
                      </div>

                      <!-- Payment Section -->
                      <TreatmentPayment 
                        :treatment="treatment"
                        :treatment-index="tIndex"
                        @add-payment="addPaymentRecord(tIndex, $event)"
                        @remove-payment="removePayment(tIndex, $event)"
                      />
                    </div>
                  </TransitionExpand>
                </div>
              </TransitionGroup>
            </div>
          </section>

          <!-- Section 4: X-Ray Gallery -->
          <section id="xray-gallery" class="content-section" v-if="treatmentType === 'tooth'">
              <div class="section-header">
                <div class="section-icon">
                  <Camera size="24" />
                </div>
                <div>
                  <h2 class="section-title">X-Ray Gallery</h2>
                  <p class="section-description">Manage X-ray images for this patient</p>
                </div>
              </div>
              
              <div class="section-content">
                <!-- Pass both patient-id and tooth-number to XRayManager -->
                <XRayManager 
                  v-if="patientId && formData.tooth_number" 
                  :patient-id="patientId" 
                  :tooth-number="formData.tooth_number"
                  @error="handleChildError" 
                />
                <div v-else class="text-center text-gray-500 py-8">
                  Please select a tooth number to manage X-rays
                </div>
              </div>
          </section>

        </form>
      </div>

      <!-- Navigation Sidebar (Right Side) -->
      <div class="navigation-sidebar">
        <div class="nav-header">
          <ListChecks size="20" class="mr-2" />
          <span class="nav-title">Sections</span>
        </div>
        <nav class="nav-menu">
          <button 
            v-for="section in navigationSections" 
            :key="section.id"
            @click="scrollToSection(section.id)"
            :class="['nav-item', { 'active': activeSection === section.id }]"
          >
            <component :is="section.icon" size="16" class="nav-icon" />
            <span>{{ section.title }}</span>
            <CheckCircle v-if="isSectionComplete(section.id)" size="14" class="nav-check" />
          </button>
        </nav>
        
        <!-- Progress Indicator -->
        <div class="progress-indicator">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: completionPercentage + '%' }"></div>
          </div>
          <span class="progress-text">{{ completionPercentage }}% Complete</span>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="loading-container">
      <LoaderCircle class="animate-spin" size="48" />
      <p>Loading Record...</p>
    </div>

    <!-- Floating Form Actions -->
    <Transition name="fade-up">
      <div v-if="hasUnsavedChanges" class="floating-actions">
        <div v-if="error" class="alert alert-error">
          <AlertTriangle class="alert-icon" />
          <span>{{ error }}</span>
          <button @click="error = null" class="alert-close" type="button">&times;</button>
        </div>
        <div class="action-buttons">
          <button type="button" @click="handleBackClick" class="btn btn-secondary">Cancel</button>
          <button type="button" @click="handleSubmit" :disabled="isSubmitting" class="btn btn-primary">
            <LoaderCircle v-if="isSubmitting" class="animate-spin mr-2" />
            {{ isSubmitting ? 'Saving...' : (isEditing ? 'Update Record' : 'Save Record') }}
          </button>
        </div>
      </div>
    </Transition>

    <!-- Unsaved Changes Modal -->
    <UnsavedChangesModal 
      :show="showUnsavedChangesModal"
      @close="showUnsavedChangesModal = false"
      @save="saveAndContinue"
      @discard="continueWithoutSaving"
    />

    <!-- Tooltip -->
    <div 
      v-if="tooltip.visible" 
      class="condition-tooltip"
      :style="{ 
        left: tooltip.x + 'px', 
        top: tooltip.y + 'px',
        transform: 'translate(-50%, -100%)'
      }"
    >
      {{ tooltip.content }}
      <div class="tooltip-arrow"></div>
    </div>
  </div>
</template>
<script setup>
import { ref, watch, onMounted, computed, nextTick } from 'vue';
import axios from 'axios';
import Cookies from 'js-cookie';
import DatePicker from './DatePicker.vue';
import UnsavedChangesModal from './UnsavedChangesModal.vue';
import XRayManager from './XRayManager.vue';
import TreatmentPayment from './TreatmentPayment.vue';
import TransitionExpand from './TransitionExpand.vue';
import SingleToothView from './SingleToothView.vue';
import ToothTreatmentSummary from './ToothTreatmentSummary.vue';
import TagSuggestionInput from './TagSuggestionInput.vue';
import treatmentTagsData from '@/assets/treatment_tags.json';
import keywordsData from '@/assets/keywords_ortho_updated.json';
import {
  X, LoaderCircle, ArrowLeft, FileText,
  ListChecks, PlusCircle, Info, Trash2, Plus, AlertTriangle,
  Smile, Camera, Eye, BarChart, CheckCircle, ChevronDown, ChevronUp, Check, Search
} from 'lucide-vue-next';

const props = defineProps({
  patientId: {
    type: [String, Number],
    required: true
  },
  initialToothNumberProp: {
    type: [String, Number],
    default: null
  },
  recordDataProp: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['close', 'record-saved', 'error', 'back-to-list']);
const config = useRuntimeConfig();

// Component State
const error = ref(null);
const isSubmitting = ref(false);
const isEditing = ref(false);
const initialFormState = ref('');
const searchInput = ref(null);

// Tooltip state
const tooltip = ref({
  visible: false,
  content: '',
  x: 0,
  y: 0
});
const showUnsavedChangesModal = ref(false);
const activeSection = ref('basic-info');

// Treatment type state - must be declared early for computed properties
const treatmentType = ref('tooth'); // 'tooth' or 'general'
const generalTreatmentName = ref('');
const nextGeneralToothNumber = ref(100); // Start from 100 for general treatments

// Active step tracking for tag assignment
const activeStep = ref({ treatmentIndex: 0, stepIndex: 0 });

// Suggestion selection state
const selectedSuggestions = ref({}); // { treatmentIndex: [selectedSteps] }

// Treatment name suggestion state
const showTreatmentSuggestions = ref(false);
const filteredTreatmentSuggestions = ref([]);

// Other condition search state
const otherConditionQuery = ref('');
const showOtherConditionDropdown = ref(false);
const otherConditionFocusedIndex = ref(-1);
const otherConditionInput = ref(null);

// General condition search state (for general treatments)
const showGeneralConditionDropdown = ref(false);
const generalConditionFocusedIndex = ref(-1);

// Track unsaved tag inputs across all steps
const unsavedTagInputs = ref({}); // { treatmentIndex-stepIndex: { hasUnaddedText: boolean, query: string } }
const tagInputRefs = ref({}); // Store refs to TagSuggestionInput components

// Condition search and display functionality
const conditionSearchQuery = ref('');
const showSearchDropdown = ref(false);
const searchDropdownConditions = ref([]);

// Initialize formData after props are available
const formData = ref({
  tooth_number: null,
  condition: '',
  other_condition_text: '',
  notes: '',
  status: 'initial',
  treatments: [],
  patient_id: null,
  treatment_name: '' // For general treatments
});

// Navigation sections - computed based on treatment type
const navigationSections = computed(() => {
  const sections = [
    { id: 'basic-info', title: 'Basic Information', icon: FileText }
  ];
  
  // Only add condition and X-ray sections for tooth treatments
  if (treatmentType.value === 'tooth') {
    sections.push(
      { id: 'condition', title: 'Tooth Condition', icon: Smile },
      { id: 'xray-gallery', title: 'X-Ray Gallery', icon: Camera }
    );
  }
  
  sections.push({ id: 'treatments', title: 'Treatment Plans', icon: ListChecks });
  
  return sections;
});

// Predefined conditions with cartoon tooth images
const predefinedConditionsWithImages = [
  { value: 'Healthy', label: 'Healthy', image: '/img/cartoon/1_ct.png' },
  { value: 'Decayed', label: 'Decayed', image: '/img/cartoon/2_ct.png' },
  { value: 'Filled', label: 'Filled', image: '/img/cartoon/3_ct.png' },
  { value: 'Missing', label: 'Missing', image: '/img/cartoon/4_ct.png' },
  { value: 'Cracked', label: 'Cracked', image: '/img/cartoon/5_ct.png' },
  { value: 'Wisdom', label: 'Wisdom', image: '/img/cartoon/6_ct.png' },
  { value: 'Fully Decayed', label: 'Fully Decayed', image: '/img/cartoon/8_ct.png' },
  { value: 'Root Canal', label: 'Root Canal', image: '/img/cartoon/9_ct.png' },
  { value: 'Impacted', label: 'Impacted', image: '/img/cartoon/10_ct.png' },
  { value: 'Tooth Removed', label: 'Tooth Removed', image: '/img/cartoon/11_ct.png' },
  { value: 'Root Canal Done', label: 'Root Canal Done', image: '/img/cartoon/9_ct.png' },
  { value: 'Removed', label: 'Removed', image: '/img/cartoon/11_ct.png' }
];

// Additional conditions with images and detailed descriptions
const additionalConditions = [
  { 
    number: '12',
    value: 'Stained', 
    label: 'Stained', 
    shortDescription: 'Teeth that look dirty or colored',
    description: 'Teeth that look dirty or colored because of things like coffee, tea, or not brushing well.',
    image: '/img/cartoon/12.png'
  },
  { 
    number: '13',
    value: 'Worn', 
    label: 'Worn', 
    shortDescription: 'Teeth that look flat or small',
    description: 'Teeth that look flat or small because they have been used a lot over time.',
    image: '/img/cartoon/13.png'
  },
  { 
    number: '14',
    value: 'Abrasion', 
    label: 'Abrasion', 
    shortDescription: 'Part of tooth rubbed away',
    description: 'A part of the tooth is rubbed away, usually from brushing too hard.',
    image: '/img/cartoon/14.png'
  },
  { 
    number: '15',
    value: 'Erosion', 
    label: 'Erosion', 
    shortDescription: 'Enamel dissolved by acids',
    description: 'The hard cover of the tooth (enamel) gets slowly dissolved by acids (like from soda or juice).',
    image: '/img/cartoon/15.png'
  },
  { 
    number: '16',
    value: 'Chipped', 
    label: 'Chipped', 
    shortDescription: 'Small piece broken off',
    description: 'A small piece of the tooth is broken off, like when biting something hard.',
    image: '/img/cartoon/16.png'
  },
  { 
    number: '18',
    value: 'Fractured Cusp', 
    label: 'Fractured Cusp', 
    shortDescription: 'Corner or point breaks off',
    description: 'A corner or point of the tooth breaks off.',
    image: '/img/cartoon/18.png'
  },
  { 
    number: '19',
    value: 'Hypersensitive', 
    label: 'Hypersensitive', 
    shortDescription: 'Sharp pain with hot/cold',
    description: 'Teeth that hurt or feel sharp pain when you eat hot, cold, or sweet things.',
    image: '/img/cartoon/19.png'
  },
  { 
    number: '20',
    value: 'Periapical Abscess', 
    label: 'Periapical Abscess', 
    shortDescription: 'Painful lump at tooth root',
    description: 'A painful lump filled with pus at the tip of the tooth root caused by infection.',
    image: '/img/cartoon/20.png'
  },
  { 
    number: '22',
    value: 'Gingivitis', 
    label: 'Gingivitis', 
    shortDescription: 'Red, swollen gums',
    description: 'Gums look red, swollen, and may bleed when brushing.',
    image: '/img/cartoon/22.png'
  },
  { 
    number: '23',
    value: 'Periodontitis', 
    label: 'Periodontitis', 
    shortDescription: 'Serious gum disease',
    description: 'A serious gum disease that makes teeth loose because the bone around them gets weak.',
    image: '/img/cartoon/23.png'
  },
  { 
    number: '27',
    value: 'Pericoronitis', 
    label: 'Pericoronitis', 
    shortDescription: 'Swelling around wisdom teeth',
    description: 'Swelling and pain around a tooth that is half-covered by gum (often wisdom teeth).',
    image: '/img/cartoon/27.png'
  },
  { 
    number: '28',
    value: 'Supernumerary', 
    label: 'Supernumerary', 
    shortDescription: 'Extra teeth beyond normal',
    description: 'Extra teeth that grow in addition to the normal set.',
    image: '/img/cartoon/28.png'
  },
  { 
    number: '29',
    value: 'Un-erupted Primary', 
    label: 'Un-erupted Primary', 
    shortDescription: 'Baby tooth never came out',
    description: 'A baby tooth that never came out through the gums.',
    image: '/img/cartoon/29.png'
  },
  { 
    number: '30',
    value: 'Retained Primary', 
    label: 'Retained Primary', 
    shortDescription: 'Baby tooth didn\'t fall out',
    description: 'A baby tooth that didn\'t fall out even when the adult tooth should replace it.',
    image: '/img/cartoon/30.png'
  },
  { 
    number: '31',
    value: 'Malocclusion', 
    label: 'Malocclusion', 
    shortDescription: 'Teeth don\'t fit properly',
    description: 'Teeth don\'t fit together properly, making the bite look uneven or crowded.',
    image: '/img/cartoon/31.png'
  },
  { 
    number: '32',
    value: 'Attrition', 
    label: 'Attrition', 
    shortDescription: 'Teeth wear from grinding',
    description: 'Teeth wear down because they rub against each other too much (like grinding).',
    image: '/img/cartoon/32.png'
  },
  { 
    number: '33',
    value: 'Enamel Hypoplasia', 
    label: 'Enamel Hypoplasia', 
    shortDescription: 'Thin or weak enamel',
    description: 'Teeth that didn\'t grow strong because the enamel (outer cover) is thin or weak.',
    image: '/img/cartoon/33.png'
  },
  { 
    number: '34',
    value: 'Amelogenesis Imperfecta', 
    label: 'Amelogenesis Imperfecta', 
    shortDescription: 'Discolored, fragile teeth',
    description: 'Teeth are discolored and fragile because enamel didn\'t form properly since birth.',
    image: '/img/cartoon/34.png'
  },
  { 
    number: '35',
    value: 'Dentinogenesis Imperfecta', 
    label: 'Dentinogenesis Imperfecta', 
    shortDescription: 'Gray/blue, brittle teeth',
    description: 'Teeth look gray or blue and break easily because the inside part (dentin) is weak.',
    image: '/img/cartoon/35.png'
  },
  { 
    number: '36',
    value: 'Gingival Recession', 
    label: 'Gingival Recession', 
    shortDescription: 'Gums recede, roots exposed',
    description: 'Gums move down, making the tooth look longer and roots get exposed.',
    image: '/img/cartoon/36.png'
  }
];

// Constants
const predefinedConditions = ["Healthy", "Decayed", "Filled", "Missing", "Cracked", "Wisdom", "Impacted"];
const statusOptions = [
  { value: 'initial', label: 'Initial' },
  { value: 'diagnosis_planned', label: 'Diagnosis Planned' },
  { value: 'intreatment', label: 'In Treatment' },
  { value: 'completed', label: 'Completed' }
];
const stepStatusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
  { value: 'completed', label: 'Completed' }, // Add this as backend might expect it
  { value: 'skipped', label: 'Skipped' },
];
const treatmentSelectOptions = [
    { value: 'checkup', label: 'Checkup' },
  { value: 'filling', label: 'Filling' },
  { value: 'root_canal', label: 'Root Canal' },
  { value: 'extraction', label: 'Extraction' },
  { value: 'crown', label: 'Crown' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'bridge', label: 'Bridge' },
  { value: 'implant', label: 'Implant' },
  { value: 'orthodontics', label: 'Orthodontics' },
  { value: 'scaling', label: 'Scaling' },

{ value: 'whitening', label: 'Teeth Whitening' }, // cosmetic
{ value: 'veneers', label: 'Veneers' }, // cosmetic
{ value: 'dentures', label: 'Dentures' }, // removable prosthetics
{ value: 'tmj_treatment', label: 'TMJ Treatment' }, // jaw-related
{ value: 'fluoride_treatment', label: 'Fluoride Treatment' }, // preventive
{ value: 'sealants', label: 'Sealants' }, // preventive
{ value: 'gingival_surgery', label: 'Gum Surgery' }, // periodontal
{ value: 'bone_graft', label: 'Bone Grafting' }, // surgical
{ value: 'sinus_lift', label: 'Sinus Lift' }, // for implants
{ value: 'night_guard', label: 'Night Guard' }, // bruxism/grinding
{ value: 'invisalign', label: 'Invisalign' }, // aligners
{ value: 'retainer', label: 'Retainer' }, // post-ortho
{ value: 'pulpotomy', label: 'Pulpotomy' }, // especially pediatric
{ value: 'space_maintainer', label: 'Space Maintainer' }, // pediatric
{ value: 'apicoectomy', label: 'Apicoectomy' }, // surgical root tip removal
{ value: 'cyst_removal', label: 'Cyst Removal' }, // surgical
{ value: 'scaling', label: 'Scaling' }, // correct the typo from 'Scalling'
  { value: 'other_treatment', label: 'Other (Specify)' },


];

function defaultStep() {
  const today = new Date().toISOString().split('T')[0];
  return { 
    description: '', 
    step_date: today, 
    status: 'pending',
    step_order: 1, // Add step_order that backend might expect
    tags: [], // Add tags array for storing multiple step items
    customDescription: '', // Add input for custom description
    is_critical: false, // Add critical toggle
    days_to_complete: null, // Add days input for critical procedures
    is_follow_up: false, // Add follow-up toggle
    follow_up_status: 'pending', // Follow-up status: pending or completed
    follow_up_date: null // Follow-up date
  };
}

function defaultTreatment() {
  return {
    treatment_type: '',
    other_treatment_text: '',
    cost: null,
    currency: 'INR',
    payments: [],
    steps: [defaultStep()],
    expanded: true
  };
}

 

// Computed Properties
const hasUnsavedChanges = computed(() => {
  // Check if form data has changed
  const formChanged = JSON.stringify(formData.value) !== initialFormState.value;
  
  // Check if there are any unsaved tag inputs
  const hasUnsavedTags = Object.values(unsavedTagInputs.value).some(input => input.hasUnaddedText);
  
  return formChanged || hasUnsavedTags;
});

// Tag suggestion computed properties
const allStepTags = computed(() => {
  const allTags = new Set();
  
  // Add common step tags
  treatmentTagsData.common_step_tags.forEach(tag => allTags.add(tag));
  
  // Add all treatment-specific tags
  Object.values(treatmentTagsData.treatment_tags).forEach(tags => {
    tags.forEach(tag => allTags.add(tag));
  });
  
  return Array.from(allTags).sort();
});

const availableStepTags = computed(() => {
  return allStepTags.value.map(tag => ({
    value: tag,
    text: formatStepName(tag),
    category: getTagCategory(tag)
  }));
});

// Get tag category for better organization in suggestions
function getTagCategory(tag) {
  if (treatmentTagsData.common_step_tags.includes(tag)) {
    return 'Common';
  }
  
  for (const [treatmentType, tags] of Object.entries(treatmentTagsData.treatment_tags)) {
    if (tags.includes(tag)) {
      const option = treatmentSelectOptions.find(o => o.value === treatmentType);
      return option ? option.label : treatmentType;
    }
  }
  
  // Check if it's from keywords data
  if (Array.isArray(keywordsData) && keywordsData.includes(tag)) {
    return 'Keywords';
  }
  
  return 'Other';
}

// Get treatment name suggestions from dental procedures
const treatmentNameSuggestions = computed(() => {
  return treatmentTagsData.dental_procedures.map(procedure => ({
    value: procedure,
    text: formatStepName(procedure),
    category: 'Procedures'
  }));
});

// Other condition suggestions - combining all keywords for comprehensive search
const otherConditionSuggestions = computed(() => {
  if (!otherConditionQuery.value || otherConditionQuery.value.length < 1) {
    return [];
  }
  
  const query = otherConditionQuery.value.toLowerCase().trim();
  const allKeywords = Array.isArray(keywordsData) ? keywordsData : [];
  
  // Filter keywords based on search query
  const filtered = allKeywords.filter(keyword => 
    keyword.toLowerCase().includes(query) || 
    keyword.toLowerCase().split(' ').some(word => word.startsWith(query))
  );
  
  return filtered.slice(0, 8).map(keyword => ({
    value: keyword,
    text: keyword,
    category: 'Medical Terms'
  }));
});

// General condition suggestions - combining treatment procedures and keywords
const generalConditionSuggestions = computed(() => {
  if (!generalTreatmentName.value || generalTreatmentName.value.length < 1) {
    return [];
  }
  
  const query = generalTreatmentName.value.toLowerCase().trim();
  
  // Combine treatment procedures and keywords
  const procedures = treatmentTagsData.dental_procedures || [];
  const keywords = Array.isArray(keywordsData) ? keywordsData : [];
  
  // Filter procedures
  const filteredProcedures = procedures.filter(procedure => 
    procedure.toLowerCase().includes(query) || 
    procedure.toLowerCase().split(' ').some(word => word.startsWith(query))
  ).map(procedure => ({
    value: procedure,
    text: formatStepName(procedure),
    category: 'Procedures'
  }));
  
  // Filter keywords
  const filteredKeywords = keywords.filter(keyword => 
    keyword.toLowerCase().includes(query) || 
    keyword.toLowerCase().split(' ').some(word => word.startsWith(query))
  ).map(keyword => ({
    value: keyword,
    text: keyword,
    category: 'Medical Terms'
  }));
  
  // Combine and limit results
  return [...filteredProcedures, ...filteredKeywords].slice(0, 8);
});

 







const overallProgress = computed(() => {
  if (!formData.value.treatments || formData.value.treatments.length === 0) return 0;
  
  const totalProgress = formData.value.treatments.reduce((sum, treatment) => {
    return sum + getTreatmentProgress(treatment);
  }, 0);
  
  return totalProgress / formData.value.treatments.length;
});

// Computed property for all conditions (predefined with images + additional conditions)
// This unifies both predefinedConditionsWithImages and additionalConditions into one list
// for easier condition validation and processing
const allConditions = computed(() => {
  return [...predefinedConditionsWithImages, ...additionalConditions];
});

// Filtered conditions (no longer filtering display, just for showing all)
const filteredConditions = computed(() => {
  return additionalConditions;
});

// Search functionality for dropdown
const searchResults = computed(() => {
  if (!conditionSearchQuery.value.trim()) {
    return [];
  }
  
  const query = conditionSearchQuery.value.toLowerCase().trim();
  const allConditions = [...predefinedConditionsWithImages, ...additionalConditions];
  
  return allConditions.filter(condition => 
    condition.label.toLowerCase().includes(query) ||
    (condition.shortDescription && condition.shortDescription.toLowerCase().includes(query)) ||
    (condition.description && condition.description.toLowerCase().includes(query))
  ).slice(0, 8); // Limit to 8 results
});

// Watchers
watch(() => props.recordDataProp, (newVal) => {
  if (newVal && newVal.id) {
    isEditing.value = true;
    
    // Process condition data using enhanced function
    const conditionData = processConditionData(newVal.condition);
    
    formData.value = {
      ...newVal,
      condition: conditionData.condition,
      other_condition_text: conditionData.other_condition_text,
      treatments: newVal.treatments ? JSON.parse(JSON.stringify(newVal.treatments)) : [],
    };
    
    // Ensure backward compatibility - add tags arrays to steps if they don't exist
    if (formData.value.treatments) {
      formData.value.treatments.forEach(treatment => {
        if (treatment.steps) {
          treatment.steps.forEach(step => {
            if (!step.tags) {
              step.tags = [];
            }
          });
        }
      });
    }
    
    // Detect treatment type based on tooth number and existing data
    if (newVal.tooth_number >= 100 || newVal.treatment_name) {
      treatmentType.value = 'general';
      // For general treatments, use the condition as the treatment name
      generalTreatmentName.value = newVal.condition || newVal.treatment_name || '';
    } else {
      treatmentType.value = 'tooth';
      generalTreatmentName.value = '';
    }
  } else {
    isEditing.value = false;
    formData.value = initialFormData();
    // Reset to default treatment type for new records
    treatmentType.value = 'tooth';
    generalTreatmentName.value = '';
  }
  storeInitialState();
}, { immediate: true, deep: true });

watch(() => props.patientId, (newId) => {
  formData.value.patient_id = newId;
}, { immediate: true });

// Watch for changes in formData.other_condition_text to sync with search query
watch(() => formData.value.other_condition_text, (newValue) => {
  if (newValue !== otherConditionQuery.value) {
    otherConditionQuery.value = newValue || '';
  }
}, { immediate: true });

// Watch for condition changes to reset other condition
watch(() => formData.value.condition, (newCondition) => {
  if (newCondition !== 'other') {
    otherConditionQuery.value = '';
    formData.value.other_condition_text = '';
  }
});

// Methods
function storeInitialState() {
  initialFormState.value = JSON.stringify(formData.value);
}

// Navigation and section management
function getCurrencySymbol(currency) {
  const symbols = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', INR: '₹' };
  return symbols[currency] || '$';
}

function scrollToSection(sectionId) {
  activeSection.value = sectionId;
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

 

// Intersection Observer for active section tracking - this is handled in the main onMounted above

function selectCondition(condition) {
  formData.value.condition = condition;
  if (condition !== 'other') {
    formData.value.other_condition_text = '';
  }
}

// Helper function to check if condition exists in our unified conditions list
function isValidCondition(conditionValue) {
  return allConditions.value.some(c => c.value === conditionValue);
}

// Enhanced function to get condition data and validate it
function processConditionData(conditionValue) {
  if (!conditionValue) {
    return { condition: '', other_condition_text: '' };
  }
  
  // Check if it's a valid predefined condition
  if (isValidCondition(conditionValue)) {
    return { condition: conditionValue, other_condition_text: '' };
  } else {
    // If not in predefined list, treat as "other"
    return { condition: 'other', other_condition_text: conditionValue };
  }
}

// Tooltip methods
function showTooltip(event, content) {
  const rect = event.target.getBoundingClientRect();
  const tooltipWidth = 300; // max-width of tooltip
  let x = rect.left + rect.width / 2;
  
  // Adjust if tooltip would go off screen
  if (x + tooltipWidth / 2 > window.innerWidth) {
    x = window.innerWidth - tooltipWidth / 2 - 10;
  } else if (x - tooltipWidth / 2 < 0) {
    x = tooltipWidth / 2 + 10;
  }
  
  tooltip.value = {
    visible: true,
    content: content,
    x: x,
    y: rect.top - 10
  };
}

function hideTooltip() {
  tooltip.value.visible = false;
}

// Search functionality methods
function handleSearchFocus() {
  showSearchDropdown.value = true;
  searchDropdownConditions.value = searchResults.value;
}

function handleSearchBlur() {
  // Delay hiding to allow click on dropdown items
  setTimeout(() => {
    showSearchDropdown.value = false;
  }, 150);
}

function handleSearchInput() {
  searchDropdownConditions.value = searchResults.value;
  showSearchDropdown.value = searchResults.value.length > 0;
}

function selectFromDropdown(condition) {
  selectCondition(condition.value);
  conditionSearchQuery.value = '';
  showSearchDropdown.value = false;
  searchInput.value?.blur();
}

function getTreatmentTitle(type, index, treatment) {
  if (type === 'other_treatment' && treatment.other_treatment_text) {
    return treatment.other_treatment_text;
  }
  const option = treatmentSelectOptions.find(o => o.value === type);
  return option ? option.label : `Treatment ${index + 1}`;
}

function getStatusIcon(status) {
  const icons = {
    'initial': '📝',
    'diagnosis_planned': '🔍',
    'intreatment': '⚡',
    'completed': '✅'
  };
  return icons[status] || '📝';
}

function getTypeBadge(type) {
  const option = treatmentSelectOptions.find(o => o.value === type);
  return option ? option.label : 'Unknown';
}

function getActualTreatmentTitle(treatment) {
  if (treatment.treatment_type === 'other_treatment' && treatment.other_treatment_text) {
    return treatment.other_treatment_text;
  }
  const option = treatmentSelectOptions.find(o => o.value === treatment.treatment_type);
  return option ? option.label : 'Select Treatment Type';
}

function getTreatmentProgress(treatment) {
  if (!treatment.steps || treatment.steps.length === 0) return 0;
  
  const completedSteps = treatment.steps.filter(step => 
    step.status === 'done' || step.status === 'completed'
  ).length;
  return (completedSteps / treatment.steps.length) * 100;
}
function getStatusBadgeIcon(status) {
  const icons = {
    'pending': '⏳',
    'in_progress': '🔄',
    'done': '✅',
    'skipped': '⏭️'
  };
  return icons[status] || '⏳';
}

function toggleTreatmentExpanded(index) {
  if (!formData.value.treatments[index].hasOwnProperty('expanded')) {
    formData.value.treatments[index].expanded = true;
  }
  formData.value.treatments[index].expanded = !formData.value.treatments[index].expanded;
}

// Treatment and Step Management
function addTreatment() {
  if (!formData.value.treatments) {
    formData.value.treatments = [];
  }
  
  const newTreatment = defaultTreatment();
  
  // If it's a general treatment, set the treatment type to "other_treatment" 
  // and populate other_treatment_text with the general treatment name
  if (treatmentType.value === 'general' && generalTreatmentName.value) {
    newTreatment.treatment_type = 'other_treatment';
    newTreatment.other_treatment_text = generalTreatmentName.value;
  }
  
  formData.value.treatments.push(newTreatment);
}

function removeTreatment(index) {
  formData.value.treatments.splice(index, 1);
}

function addStep(treatmentIndex) {
  formData.value.treatments[treatmentIndex].steps.push(defaultStep());
}

function removeStep(treatmentIndex, stepIndex) {
  formData.value.treatments[treatmentIndex].steps.splice(stepIndex, 1);
}

// Suggested Steps Management
function getSuggestedSteps(treatmentType) {
  return treatmentTagsData.treatment_tags[treatmentType] || [];
}

function addStepTag(treatmentIndex, suggestedStep) {
  const treatment = formData.value.treatments[treatmentIndex];
  const formattedStep = formatStepName(suggestedStep);
  
  // Use active step if it exists and belongs to the same treatment
  let targetStepIndex = 0;
  if (activeStep.value.treatmentIndex === treatmentIndex && 
      treatment.steps[activeStep.value.stepIndex]) {
    targetStepIndex = activeStep.value.stepIndex;
  } else if (treatment.steps.length > 0) {
    // Use the last step if no active step or active step is from different treatment
    targetStepIndex = treatment.steps.length - 1;
    // Update active step to the target step
    activeStep.value = { treatmentIndex, stepIndex: targetStepIndex };
  } else {
    // Create first step if none exist
    const newStep = {
      ...defaultStep(),
      description: "",
      tags: [formattedStep]
    };
    treatment.steps.push(newStep);
    activeStep.value = { treatmentIndex, stepIndex: 0 };
    return;
  }
  
  const targetStep = treatment.steps[targetStepIndex];
  if (!targetStep.tags) {
    targetStep.tags = [];
  }
  
  // Check if tag already exists in this step
  const tagExists = targetStep.tags.some(tag => 
    tag.toLowerCase() === formattedStep.toLowerCase()
  );
  
  if (!tagExists) {
    targetStep.tags.push(formattedStep);
  }
  
  // Ensure the step that received the tag is marked as active
  activeStep.value = { treatmentIndex, stepIndex: targetStepIndex };
}

// Set active step when user focuses on a step
function setActiveStep(treatmentIndex, stepIndex) {
  activeStep.value = { treatmentIndex, stepIndex };
}

// Handle follow-up toggle to ensure default status is set
function onFollowUpToggle(step) {
  if (step.is_follow_up && !step.follow_up_status) {
    step.follow_up_status = 'pending';
  }
}

// Add custom tag to specific step
function addCustomTagToStep(treatmentIndex, stepIndex, tagText) {
  if (!tagText || !tagText.trim()) return;
  
  const treatment = formData.value.treatments[treatmentIndex];
  const step = treatment.steps[stepIndex];
  
  if (!step.tags) {
    step.tags = [];
  }
  
  const trimmedTag = tagText.trim();
  
  // Check if tag already exists
  const tagExists = step.tags.some(tag => 
    tag.toLowerCase() === trimmedTag.toLowerCase()
  );
  
  if (!tagExists) {
    step.tags.push(trimmedTag);
    // Clear the input
    step.customDescription = '';
  }
}

function removeStepTag(treatmentIndex, stepIndex, tagIndex) {
  const treatment = formData.value.treatments[treatmentIndex];
  const step = treatment.steps[stepIndex];
  if (step.tags && step.tags.length > tagIndex) {
    step.tags.splice(tagIndex, 1);
  }
}

function formatStepName(stepName) {
  return stepName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// New tag suggestion methods
function getStepSuggestions(treatmentType) {
  // Combine treatment-specific tags with common tags
  const treatmentSpecific = treatmentTagsData.treatment_tags[treatmentType] || [];
  const commonTags = treatmentTagsData.common_step_tags || [];
  
  // Add all keywords from the JSON file
  const allKeywords = Array.isArray(keywordsData) ? keywordsData : [];
  
  // Combine all sources - treatment specific first, then common, then all keywords
  const combined = [...treatmentSpecific, ...commonTags, ...allKeywords];
  
  // Remove duplicates by converting to Set and back
  const uniqueTags = [...new Set(combined)];
  
  return uniqueTags.map(tag => ({
    value: tag,
    text: formatStepName(tag),
    category: getTagCategory(tag)
  }));
}

function onStepTagAdded(treatmentIndex, stepIndex, tag) {
  const treatment = formData.value.treatments[treatmentIndex];
  const step = treatment.steps[stepIndex];
  
  if (!step.tags) {
    step.tags = [];
  }
  
  // The TagSuggestionInput component already handles duplicates,
  // so we can just ensure the step has the tag
  if (!step.tags.includes(tag)) {
    step.tags.push(tag);
  }
  
  // Clear unsaved input state for this step
  const key = `${treatmentIndex}-${stepIndex}`;
  if (unsavedTagInputs.value[key]) {
    unsavedTagInputs.value[key] = { hasUnaddedText: false, query: '' };
  }
}

function onStepTagRemoved(treatmentIndex, stepIndex, tag) {
  const treatment = formData.value.treatments[treatmentIndex];
  const step = treatment.steps[stepIndex];
  
  if (step.tags) {
    const index = step.tags.indexOf(tag);
    if (index > -1) {
      step.tags.splice(index, 1);
    }
  }
}

function onTagInputChanged(treatmentIndex, stepIndex, inputData) {
  const key = `${treatmentIndex}-${stepIndex}`;
  unsavedTagInputs.value[key] = {
    hasUnaddedText: inputData.hasUnaddedText,
    query: inputData.query
  };
}

// Treatment name suggestion methods
function filterTreatmentSuggestions(event) {
  const query = event.target.value.toLowerCase();
  if (!query || query.length < 2) {
    filteredTreatmentSuggestions.value = treatmentNameSuggestions.value.slice(0, 8);
    return;
  }
  
  filteredTreatmentSuggestions.value = treatmentNameSuggestions.value
    .filter(suggestion => 
      suggestion.text.toLowerCase().includes(query) ||
      suggestion.value.toLowerCase().includes(query)
    )
    .slice(0, 8);
}

function selectTreatmentSuggestion(treatment, suggestionText) {
  treatment.other_treatment_text = suggestionText;
  showTreatmentSuggestions.value = false;
}

function hideTreatmentSuggestionsDelayed() {
  setTimeout(() => {
    showTreatmentSuggestions.value = false;
  }, 150);
}

// Other condition search methods
function onOtherConditionInput(event) {
  otherConditionQuery.value = event.target.value;
  formData.value.other_condition_text = event.target.value;
  updateOtherConditionSuggestions();
}

function updateOtherConditionSuggestions() {
  if (!otherConditionQuery.value || otherConditionQuery.value.length < 1) {
    showOtherConditionDropdown.value = false;
    otherConditionFocusedIndex.value = -1;
    return;
  }
  
  showOtherConditionDropdown.value = otherConditionSuggestions.value.length > 0;
  otherConditionFocusedIndex.value = otherConditionSuggestions.value.length > 0 ? 0 : -1;
}

function selectOtherConditionSuggestion(suggestion) {
  otherConditionQuery.value = suggestion.value;
  formData.value.other_condition_text = suggestion.value;
  showOtherConditionDropdown.value = false;
  otherConditionFocusedIndex.value = -1;
}

function onOtherConditionKeydown(event) {
  if (!showOtherConditionDropdown.value || otherConditionSuggestions.value.length === 0) {
    return;
  }
  
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    otherConditionFocusedIndex.value = (otherConditionFocusedIndex.value + 1) % otherConditionSuggestions.value.length;
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    otherConditionFocusedIndex.value = (otherConditionFocusedIndex.value - 1 + otherConditionSuggestions.value.length) % otherConditionSuggestions.value.length;
  } else if (event.key === 'Enter') {
    event.preventDefault();
    if (otherConditionFocusedIndex.value >= 0) {
      selectOtherConditionSuggestion(otherConditionSuggestions.value[otherConditionFocusedIndex.value]);
    }
  } else if (event.key === 'Escape') {
    showOtherConditionDropdown.value = false;
    otherConditionFocusedIndex.value = -1;
  }
}

function onOtherConditionFocus() {
  if (otherConditionQuery.value && otherConditionSuggestions.value.length > 0) {
    showOtherConditionDropdown.value = true;
  }
}

function onOtherConditionBlur() {
  setTimeout(() => {
    showOtherConditionDropdown.value = false;
  }, 150);
}

// General condition search methods (for general treatments)
function onGeneralConditionInput(event) {
  generalTreatmentName.value = event.target.value;
  updateGeneralConditionSuggestions();
}

function updateGeneralConditionSuggestions() {
  if (!generalTreatmentName.value || generalTreatmentName.value.length < 1) {
    showGeneralConditionDropdown.value = false;
    generalConditionFocusedIndex.value = -1;
    return;
  }
  
  showGeneralConditionDropdown.value = generalConditionSuggestions.value.length > 0;
  generalConditionFocusedIndex.value = generalConditionSuggestions.value.length > 0 ? 0 : -1;
}

function selectGeneralConditionSuggestion(suggestion) {
  generalTreatmentName.value = suggestion.value;
  showGeneralConditionDropdown.value = false;
  generalConditionFocusedIndex.value = -1;
}

function onGeneralConditionKeydown(event) {
  if (!showGeneralConditionDropdown.value || generalConditionSuggestions.value.length === 0) {
    return;
  }
  
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    generalConditionFocusedIndex.value = (generalConditionFocusedIndex.value + 1) % generalConditionSuggestions.value.length;
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    generalConditionFocusedIndex.value = (generalConditionFocusedIndex.value - 1 + generalConditionSuggestions.value.length) % generalConditionSuggestions.value.length;
  } else if (event.key === 'Enter') {
    event.preventDefault();
    if (generalConditionFocusedIndex.value >= 0) {
      selectGeneralConditionSuggestion(generalConditionSuggestions.value[generalConditionFocusedIndex.value]);
    }
  } else if (event.key === 'Escape') {
    showGeneralConditionDropdown.value = false;
    generalConditionFocusedIndex.value = -1;
  }
}

function onGeneralConditionFocus() {
  if (generalTreatmentName.value && generalConditionSuggestions.value.length > 0) {
    showGeneralConditionDropdown.value = true;
  }
}

function onGeneralConditionBlur() {
  setTimeout(() => {
    showGeneralConditionDropdown.value = false;
  }, 150);
}

// Initialize filtered suggestions
onMounted(() => {
  filteredTreatmentSuggestions.value = treatmentNameSuggestions.value.slice(0, 8);
});

// Generate step description from tags and custom description
function generateStepDescription(step) {
  let description = '';
  
  if (step.tags && step.tags.length > 0) {
    description = step.tags.join(', ');
  }
  
  if (step.customDescription && step.customDescription.trim()) {
    if (description) {
      description += ' - ' + step.customDescription.trim();
    } else {
      description = step.customDescription.trim();
    }
  }
  
  return description || 'Treatment Step';
}

// Payment Management
function addPaymentRecord(treatmentIndex, paymentData) {
  const treatment = formData.value.treatments[treatmentIndex];
  if (!treatment.payments) {
    treatment.payments = [];
  }
  treatment.payments.push({
    ...paymentData,
    date: paymentData.date instanceof Date ? paymentData.date.toISOString().split('T')[0] : paymentData.date,
  });
}

function removePayment(treatmentIndex, paymentIndex) {
  formData.value.treatments[treatmentIndex].payments.splice(paymentIndex, 1);
}

// Navigation and Saving
function handleBackClick() {
  if (hasUnsavedChanges.value) {
    showUnsavedChangesModal.value = true;
  } else {
    emit('back-to-list');
  }
}

function continueWithoutSaving() {
  showUnsavedChangesModal.value = false;
  emit('back-to-list');
}

async function saveAndContinue() {
  await handleSubmit(true); // Pass flag to indicate we want to navigate after
}
 

function handleChildError(errorMessage) {
  error.value = errorMessage;
}

onMounted(() => {
  // Initialize form data with props values
  if (!formData.value.patient_id) {
    formData.value.patient_id = props.patientId;
  }
  if (!formData.value.tooth_number && props.initialToothNumberProp) {
    formData.value.tooth_number = props.initialToothNumberProp;
  }
  
  storeInitialState();
  
  // Auto-focus search input when in tooth condition section
  nextTick(() => {
    if (treatmentType.value === 'tooth' && searchInput.value) {
      searchInput.value.focus();
    }
  });
  
  // Intersection Observer for active section tracking
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeSection.value = entry.target.id;
        }
      });
    },
    { rootMargin: '-50% 0px -50% 0px' }
  );
  
  // Watch for changes in navigationSections and observe them
  watch(navigationSections, (newSections) => {
    // Clear previous observations
    observer.disconnect();
    
    // Observe new sections
    newSections.forEach(section => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });
  }, { immediate: true });
});






// Updated initial form data function
function initialFormData() {
  return {
    tooth_number: props.initialToothNumberProp || null,
    condition: '',
    other_condition_text: '',
    notes: '',
    status: 'initial',
    treatments: [],
    patient_id: props.patientId || null,
    treatment_name: '' // For general treatments
  };
}

// New method to handle treatment type selection
function selectTreatmentType(type) {
  treatmentType.value = type;
  
  if (type === 'general') {
    // Assign next available general tooth number (100+)
    formData.value.tooth_number = getNextGeneralToothNumber();
    formData.value.treatment_name = generalTreatmentName.value;
    
    // For general treatments, use the treatment name as the condition
    formData.value.condition = generalTreatmentName.value;
    formData.value.other_condition_text = '';
    
    // Update existing treatments to use general treatment name (with small delay)
    nextTick(() => {
      if (formData.value.treatments && formData.value.treatments.length > 0) {
        formData.value.treatments.forEach(treatment => {
          if (generalTreatmentName.value) {
            treatment.treatment_type = 'other_treatment';
            treatment.other_treatment_text = generalTreatmentName.value;
          }
        });
      }
    });
  } else {
    // Reset to regular tooth treatment
    formData.value.tooth_number = props.initialToothNumberProp;
    formData.value.treatment_name = '';
    generalTreatmentName.value = '';
    
    // Reset treatments to default state - remove the automatic other_treatment assignment
    nextTick(() => {
      if (formData.value.treatments && formData.value.treatments.length > 0) {
        formData.value.treatments.forEach(treatment => {
          if (treatment.treatment_type === 'other_treatment' && !treatment.other_treatment_text) {
            treatment.treatment_type = '';
            treatment.other_treatment_text = '';
          }
        });
      }
    });
  }
}

// Method to get next available general tooth number
function getNextGeneralToothNumber() {
  // You could make an API call here to get the next available number
  // For now, we'll increment from 100
  const currentNumber = nextGeneralToothNumber.value;
  nextGeneralToothNumber.value++;
  return currentNumber;
}

// Updated computed property for section completion
const completionPercentage = computed(() => {
  // Include different sections based on treatment type
  const sections = treatmentType.value === 'general' 
    ? ['basic-info', 'treatments'] // No condition section for general treatments
    : ['basic-info', 'condition', 'treatments']; // Include condition for tooth treatments
    
  const completed = sections.filter(sectionId => isSectionComplete(sectionId)).length;
  return Math.round((completed / sections.length) * 100);
});

// Updated section completion check
 

// Watch for changes in general treatment name
watch(generalTreatmentName, (newName) => {
  if (treatmentType.value === 'general') {
    formData.value.treatment_name = newName;
    // Also update the condition for general treatments
    formData.value.condition = newName;
    
    // Update all existing treatments in the list to use the new general treatment name
    if (formData.value.treatments && formData.value.treatments.length > 0) {
      formData.value.treatments.forEach(treatment => {
        if (treatment.treatment_type === 'other_treatment') {
          treatment.other_treatment_text = newName;
        }
      });
    }
  }
});

// Enhanced validation function for form data
function validateFormData() {
  const errors = [];
  
  // Validate basic information
  if (treatmentType.value === 'tooth' && !formData.value.tooth_number) {
    errors.push("Tooth number is required for tooth treatments");
  }
  
  if (treatmentType.value === 'general' && !generalTreatmentName.value) {
    errors.push("Treatment name is required for general treatments");
  }
  
  // Validate condition (only required for tooth treatments)
  if (treatmentType.value === 'tooth') {
    if (!formData.value.condition) {
      errors.push("Condition is required");
    } else if (formData.value.condition === 'other' && !formData.value.other_condition_text) {
      errors.push("Please specify the other condition");
    }
  }
  
  // Validate treatments
  if (formData.value.treatments && formData.value.treatments.length > 0) {
    formData.value.treatments.forEach((treatment, index) => {
      if (!treatment.treatment_type) {
        errors.push(`Treatment ${index + 1}: Treatment type is required`);
      }
      if (treatment.treatment_type === 'other_treatment' && !treatment.other_treatment_text) {
        errors.push(`Treatment ${index + 1}: Please specify the other treatment`);
      }
    });
  }
  
  return errors;
}

// Updated handleSubmit method to handle general treatments
async function handleSubmit(navigateBack = false) {
  isSubmitting.value = true;
  error.value = null;

  // Validate form data before submission
  const validationErrors = validateFormData();
  if (validationErrors.length > 0) {
    error.value = validationErrors.join('; ');
    isSubmitting.value = false;
    return;
  }

  const token = Cookies.get('dental_access_token');
  if (!token) {
    error.value = "Authentication token not found. Please log in again.";
    isSubmitting.value = false;
    emit('error', 'Session expired.');
    return;
  }

  // Before creating the payload, process any un-tagged descriptions and unsaved tag inputs
  if (formData.value.treatments) {
    formData.value.treatments.forEach((treatment, tIndex) => {
      if (treatment.steps) {
        treatment.steps.forEach((step, sIndex) => {
          // Process custom descriptions
          if (step.customDescription && step.customDescription.trim()) {
            if (!step.tags) {
              step.tags = [];
            }
            const newTag = step.customDescription.trim();
            if (!step.tags.includes(newTag)) {
              step.tags.push(newTag);
            }
            // Clear the custom description so it's not saved separately
            step.customDescription = '';
          }
          
          // Process unsaved tag inputs
          const inputKey = `${tIndex}-${sIndex}`;
          const tagInput = unsavedTagInputs.value[inputKey];
          if (tagInput && tagInput.hasUnaddedText && tagInput.query.trim()) {
            if (!step.tags) {
              step.tags = [];
            }
            const newTag = tagInput.query.trim();
            if (!step.tags.includes(newTag)) {
              step.tags.push(newTag);
            }
            // Clear the unsaved input state
            unsavedTagInputs.value[inputKey] = { hasUnaddedText: false, query: '' };
          }
        });
      }
    });
  }

  // Prepare payload
  const payload = JSON.parse(JSON.stringify(formData.value));
  
  // Generate descriptions from tags for all steps
  if (payload.treatments) {
    payload.treatments.forEach(treatment => {
      if (treatment.steps) {
        treatment.steps.forEach(step => {
          step.description = generateStepDescription(step);
          // Remove temporary fields that shouldn't be sent to backend
          delete step.customDescription;
        });
      }
    });
  }
  
  // Handle condition 
  if (treatmentType.value === 'tooth') {
    if (payload.condition === 'other') {
      payload.condition = payload.other_condition_text;
    }
  } else {
    // For general treatments, set condition to the treatment name
    payload.condition = generalTreatmentName.value;
  }
  delete payload.other_condition_text;

  // For general treatments, ensure tooth_number is 100+
  if (treatmentType.value === 'general') {
    if (!payload.tooth_number || payload.tooth_number < 100) {
      payload.tooth_number = getNextGeneralToothNumber();
    }
    // Add treatment name to notes or reason for context
    payload.reason = payload.reason || generalTreatmentName.value;
  }

  // Ensure patient_id is set
  if (!payload.patient_id) {
    payload.patient_id = props.patientId;
  }

  try {
    let response;
    const url = `${config.public.API_BASE_URL}/patients/${props.patientId}/dental-records`;
    const headers = { Authorization: `Bearer ${token}` };

    response = await axios.post(url, payload, { headers });

    if (response.data && (response.data.message || response.status === 200 || response.status === 201)) {
      storeInitialState();
      emit('record-saved');
      if (navigateBack) {
        emit('back-to-list');
      }
    } else {
      throw new Error(response.data.message || 'An unknown error occurred.');
    }
  } catch (err) {
    console.error("Error saving record:", err);
    error.value = err.response?.data?.error || err.message || "Failed to save record.";
    emit('error', error.value);
  } finally {
    isSubmitting.value = false;
  }
}





// Update the existing isSectionComplete function to handle treatment typessssssssssssssssssss
function isSectionComplete(sectionId) {
  switch (sectionId) {
    case 'basic-info':
      // Handle both treatment types
      if (treatmentType.value === 'tooth') {
        return formData.value.tooth_number && formData.value.status;
      } else if (treatmentType.value === 'general') {
        return generalTreatmentName.value && formData.value.status;
      }
      // Fallback for existing records without treatment type
      return formData.value.tooth_number && formData.value.status;
      
    case 'condition':
      // Only required for tooth treatments, not general treatments
      if (treatmentType.value === 'general') {
        return true; // Always complete for general treatments
      }
      return formData.value.condition && (formData.value.condition !== 'other' || formData.value.other_condition_text);
      
    case 'treatments':
      return formData.value.treatments && formData.value.treatments.length > 0;
      
    case 'tooth-overview':
      // Only complete if it's a tooth treatment (not general)
      return treatmentType.value === 'tooth' && formData.value.tooth_number;
      
    case 'xray-gallery':
      return true; // Optional section
      
    case 'summary':
      return formData.value.treatments && formData.value.treatments.length > 0;
      
    default:
      return false;
  }
}




</script>








<style scoped>
.btn-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  color: #6b7280;
  border: 2px solid #e5e7eb;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  backdrop-filter: blur(10px);
}
.btn-close:hover {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  color: #dc2626;
  border-color: #fca5a5;
  transform: scale(1.05);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}
.dark .btn-close {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  color: #9ca3af;
  border-color: #374151;
}
.dark .btn-close:hover {
  background: linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%);
  color: #fca5a5;
  border-color: #dc2626;
}

/* Base Styles */
.record-detail-view-redesigned {
  padding: 1rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
  font-family: 'Inter', 'Segoe UI', sans-serif;
}
.dark .record-detail-view-redesigned {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

/* Top Navigation */
.top-navigation-bar {
  margin-bottom: 2rem;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  color: #475569;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}
.btn-back:hover {
  color: #1d4ed8;
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.dark .btn-back {
  color: #e2e8f0;
  background: rgba(30, 41, 59, 0.8);
  border-color: #475569;
}
.dark .btn-back:hover {
  color: #93c5fd;
  background: rgba(30, 41, 59, 0.95);
}

/* Layout Container */
.layout-container {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 1024px) {
  .layout-container {
    grid-template-columns: 1fr;
  }
  .navigation-sidebar {
    order: -1;
  }
}

/* Top Overview Section */
.top-overview-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .top-overview-section {
    grid-template-columns: 1fr;
  }
}

.overview-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-height: 500px;
  display: flex;
  flex-direction: column;
}

.overview-card-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;
}

.overview-card-content::-webkit-scrollbar {
  width: 6px;
}

.overview-card-content::-webkit-scrollbar-track {
  background: #f7fafc;
  border-radius: 10px;
}

.overview-card-content::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 10px;
}

.overview-card-content::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

.dark .overview-card {
  background: rgba(30, 41, 59, 0.95);
  border-color: #475569;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.dark .overview-card-content::-webkit-scrollbar-track {
  background: #475569;
}

.dark .overview-card-content::-webkit-scrollbar-thumb {
  background: #64748b;
}

.dark .overview-card-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.overview-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  border-bottom: 1px solid #e2e8f0;
}
.dark .overview-header {
  background: linear-gradient(135deg, #334155, #475569);
  border-bottom-color: #475569;
}

.overview-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}
.dark .overview-header h3 {
  color: #f1f5f9;
}

/* Main Content */
.main-content {
  min-height: 100vh;
  max-width: 900px;
}

.content-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Content Section */
.content-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  scroll-margin-top: 2rem;
}
.dark .content-section {
  background: rgba(30, 41, 59, 0.95);
  border-color: #475569;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: 1px solid #e2e8f0;
}
.dark .section-header {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-bottom-color: #475569;
}

.section-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 12px;
  color: white;
  flex-shrink: 0;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}
.dark .section-title {
  color: #f1f5f9;
}

.section-description {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0.25rem 0 0 0;
}
.dark .section-description {
  color: #94a3b8;
}

.section-title-area {
  flex: 1;
}

.section-content {
  padding: 1.5rem 2rem;
}

/* Progress Circles */
.overall-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.progress-circle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-ring {
  transform: rotate(-90deg);
  transition: stroke-dashoffset 0.5s ease;
}

.progress-ring-fill {
  transition: stroke-dashoffset 0.5s ease;
}

.progress-text-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
}
.dark .progress-text-overlay {
  color: #f1f5f9;
}

.progress-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
  text-align: center;
}
.dark .progress-label {
  color: #94a3b8;
}

/* Basic Information Styles */
.basic-info-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Treatment Type Selection */
.treatment-type-group {
  width: 100%;
}

.treatment-type-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 0.75rem;
}

@media (max-width: 640px) {
  .treatment-type-options {
    grid-template-columns: 1fr;
  }
}

.treatment-type-option {
  display: flex;
  Align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}
.dark .treatment-type-option {
  background: rgba(55, 65, 81, 0.9);
  border-color: #4b5563;
}

.treatment-type-option:hover {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
}

.treatment-type-option.selected {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.25);
  transform: translateY(-2px);
}
.dark .treatment-type-option.selected {
  background: linear-gradient(135deg, #1e3a8a, #1d4ed8);
}

.option-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.option-content {
  flex: 1;
}

.option-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
}
.dark .option-title {
  color: #e5e7eb;
}
.treatment-type-option.selected .option-title {
  color: #1e40af;
  font-weight: 700;
}
.dark .treatment-type-option.selected .option-title {
  color: #dbeafe;
}

.option-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}
.dark .option-description {
  color: #9ca3af;
}
.treatment-type-option.selected .option-description {
  color: #3730a3;
}
.dark .treatment-type-option.selected .option-description {
  color: #c7d2fe;
}

/* Tooth Info Group */
.tooth-info-group {
  width: 100%;
}

/* Tooth Number Container */
.tooth-number-container {
  max-width: 300px;
}

.tooth-number-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.tooth-number-input {
  flex: 1;
  padding-right: 3rem;
}

.tooth-number-dropdown {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  border-left: 1px solid #e5e7eb;
  background: #f9fafb;
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
}
.dark .tooth-number-dropdown {
  border-left-color: #4b5563;
  background: #4b5563;
}

.dropdown-trigger {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}
.dark .dropdown-trigger {
  color: #9ca3af;
}
.dropdown-trigger:hover {
  color: #374151;
  background: rgba(0, 0, 0, 0.05);
}
.dark .dropdown-trigger:hover {
  color: #e5e7eb;
  background: rgba(255, 255, 255, 0.1);
}

/* General Treatment Container */
.general-treatment-container {
  max-width: 500px;
}

/* Record Status */
.status-group {
  width: 100%;
}

.status-options-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-top: 0.75rem;
}

@media (max-width: 768px) {
  .status-options-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .status-options-grid {
    grid-template-columns: 1fr;
  }
}

.status-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1rem;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}
.dark .status-option {
  background: rgba(55, 65, 81, 0.9);
  border-color: #4b5563;
}

.status-option:hover {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
}

.status-option.selected {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.25);
  transform: translateY(-2px);
}
.dark .status-option.selected {
  background: linear-gradient(135deg, #1e3a8a, #1d4ed8);
}

.status-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}
.dark .status-icon-container {
  background: rgba(30, 41, 59, 0.8);
  border-color: #4b5563;
}
.status-option.selected .status-icon-container {
  background: rgba(255, 255, 255, 0.9);
  border-color: #3b82f6;
}
.dark .status-option.selected .status-icon-container {
  background: rgba(59, 130, 246, 0.2);
  border-color: #93c5fd;
}

.status-icon {
  font-size: 1.5rem;
  display: block;
}

.status-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}
.dark .status-label {
  color: #e5e7eb;
}
.status-option.selected .status-label {
  color: #1e40af;
  font-weight: 700;
}
.dark .status-option.selected .status-label {
  color: #dbeafe;
}

/* Form Styles */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.dark .form-label {
  color: #e5e7eb;
}
.form-label.required::after {
  content: '*';
  color: #ef4444;
}

.form-help {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}
.dark .form-help {
  color: #9ca3af;
}

.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.2s ease;
  color: #1f2937;
  font-size: 0.875rem;
}
.dark .form-input, .dark .form-select, .dark .form-textarea {
  background: rgba(55, 65, 81, 0.9);
  border-color: #4b5563;
  color: #f3f4f6;
}
.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: rgba(255, 255, 255, 1);
  transform: scale(1.01);
}
.dark .form-input:focus, .dark .form-select:focus, .dark .form-textarea:focus {
  background: rgba(55, 65, 81, 1);
}
.form-input:disabled {
  background: #f3f4f6;
  color: #9ca3af;
}
.dark .form-input:disabled {
  background: #374151;
  color: #6b7280;
}

/* Navigation Sidebar */
.navigation-sidebar {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 1.5rem;
  height: fit-content;
  position: sticky;
  top: 2rem;
  border: 1px solid #e2e8f0;
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
.dark .navigation-sidebar {
  background: rgba(30, 41, 59, 0.95);
  border-color: #475569;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.nav-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
}
.dark .nav-header {
  border-bottom-color: #475569;
}

.nav-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
}
.dark .nav-title {
  color: #f1f5f9;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  text-align: left;
  width: 100%;
}
.nav-item:hover {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  transform: translateX(4px);
}
.nav-item:hover .nav-icon {
  transform: translateX(2px);
  transition: transform 0.2s ease;
}
.nav-item.active {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}
.nav-item:focus {
  outline: 2px solid #3b82f6;
  outline-offset: -2px;
}
.dark .nav-item {
  color: #94a3b8;
}
.dark .nav-item:hover {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
}

.nav-icon {
  flex-shrink: 0;
}

.nav-check {
  margin-left: auto;
  color: #10b981;
}

/* Progress Indicator */
.progress-indicator {
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}
.dark .progress-indicator {
  border-top-color: #475569;
}

.progress-bar {
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}
.dark .progress-bar {
  background: #475569;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}
.dark .progress-text {
  color: #94a3b8;
}

/* Treassssssssssssstment Progress */
.treatment-progress {
  display: flex;
  align-items: center;
  margin-right: 1rem;
}

.treatment-progress-circle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-ring-small {
  transform: rotate(-90deg);
  transition: stroke-dashoffset 0.5s ease;
}

.progress-text-small {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.625rem;
  font-weight: 600;
  color: #1e293b;
}
.dark .progress-text-small {
  color: #f1f5f9;
}

/* Condition Visual Grid */
.condition-visual-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
  width: 100%;
}

.condition-card {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  min-height: 140px;
  scale: 1.03;
}
.dark .condition-card {
  background: rgba(55, 65, 81, 0.9);
  border-color: #4b5563;
}

.condition-card:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 15px 35px rgba(59, 130, 246, 0.2);
}
.condition-card:hover .tooth-icon-full {
  transform: scale(1.1);
  transition: transform 0.3s ease;
}
.condition-card:hover .other-icon-full {
  transform: scale(1.1);
  transition: transform 0.3s ease;
}
.condition-card.selected {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.25);
  scale: 1.05;
}
.dark .condition-card.selected {
  background: linear-gradient(135deg, #1e3a8a, #1d4ed8);
}
.condition-card:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.tooth-icon-full {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border: none;
  border-radius: 0;
  box-shadow: none;
}

.other-icon-full {
  color: #6b7280;
  width: 60px;
  height: 60px;
}
.condition-card.selected .other-icon-full {
  color: #3b82f6;
}
.dark .other-icon-full {
  color: #9ca3af;
}
.dark .condition-card.selected .other-icon-full {
  color: #93c5fd;
}

.other-condition {
  border-style: dashed;
}

/* Diagnosis Notes spacing */
.diagnosis-notes-group {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}
.dark .diagnosis-notes-group {
  border-top-color: #475569;
}

/* Additional Conditions Section */
.additional-conditions-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}
.dark .additional-conditions-section {
  border-top-color: #475569;
}

.additional-conditions-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}
.dark .additional-conditions-title {
  color: #d1d5db;
}

.condition-box {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 50px;
  text-align: center;
  position: relative;
}
.dark .condition-box {
  background: rgba(55, 65, 81, 0.9);
  border-color: #4b5563;
}

.condition-box:hover {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.15);
}

.condition-box.selected {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.25);
  transform: translateY(-2px);
}
.dark .condition-box.selected {
  background: linear-gradient(135deg, #1e3a8a, #1d4ed8);
}

.condition-box:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.condition-box-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  line-height: 1.3;
}
.dark .condition-box-label {
  color: #d1d5db;
}

.condition-box.selected .condition-box-label {
  color: #1e3a8a;
  font-weight: 600;
}
.dark .condition-box.selected .condition-box-label {
  color: #bfdbfe;
}

/* Search Bar Styles */
.condition-search-container {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #6b7280;
  z-index: 1;
}

/* Search Dropdown Styles */
.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 320px;
  overflow-y: auto;
  margin-top: 4px;
}

.dark .search-dropdown {
  background: #374151;
  border-color: #4b5563;
}

.search-dropdown-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f3f4f6;
  gap: 12px;
}

.search-dropdown-item:last-child {
  border-bottom: none;
}

.search-dropdown-item:hover {
  background: #f8fafc;
}

.dark .search-dropdown-item {
  border-bottom-color: #4b5563;
}

.dark .search-dropdown-item:hover {
  background: #4b5563;
}

.dropdown-condition-image {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}

.dropdown-condition-info {
  flex: 1;
  min-width: 0;
}

.dropdown-condition-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
  margin-bottom: 2px;
}

.dark .dropdown-condition-name {
  color: #f3f4f6;
}

.dropdown-condition-description {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dark .dropdown-condition-description {
  color: #9ca3af;
}

.condition-search-input {
  padding: 12px 16px 12px 40px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  width: 250px;
  transition: all 0.2s ease;
  height: 44px;
}

.condition-search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.dark .condition-search-input {
  background: #374151;
  border-color: #4b5563;
  color: #f3f4f6;
}

.dark .condition-search-input:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
}

.dark .search-icon {
  color: #9ca3af;
}

/* Other Condition Search Styles */
.other-condition-search-container {
  position: relative;
  width: 100%;
}

.other-condition-search-container .search-input-wrapper {
  position: relative;
  width: 100%;
}

.other-condition-search-container .condition-search-input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  transition: all 0.2s;
}

.other-condition-search-container .condition-search-input:focus {
  outline: none;
  border-color: #5b7cff;
  box-shadow: 0 0 0 3px rgba(91, 124, 255, 0.1);
}

.other-condition-search-container .search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  pointer-events: none;
}

.other-condition-search-container .search-dropdown {
  position: absolute;
  z-index: 20;
  width: 100%;
  margin: 4px 0 0;
  padding: 4px 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  max-height: 280px;
  overflow-y: auto;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.other-condition-search-container .search-dropdown-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.other-condition-search-container .search-dropdown-item:hover,
.other-condition-search-container .search-dropdown-item.focused {
  background: #f3f4f6;
}

.other-condition-search-container .dropdown-condition-info {
  flex: 1;
}

.other-condition-search-container .dropdown-condition-name {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.other-condition-search-container .dropdown-condition-description {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

/* Dark mode for other condition search */
.dark .other-condition-search-container .condition-search-input {
  background: #374151;
  border-color: #4b5563;
  color: #f3f4f6;
}

.dark .other-condition-search-container .condition-search-input:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
}

.dark .other-condition-search-container .search-icon {
  color: #9ca3af;
}

.dark .other-condition-search-container .search-dropdown {
  background: #1f2937;
  border-color: #374151;
}

.dark .other-condition-search-container .search-dropdown-item:hover,
.dark .other-condition-search-container .search-dropdown-item.focused {
  background: #374151;
}

.dark .other-condition-search-container .dropdown-condition-name {
  color: #d1d5db;
}

.dark .other-condition-search-container .dropdown-condition-description {
  color: #9ca3af;
}

/* Section Header with Search */
.section-title-area {
  flex: 1;
}

/* Tooltip Styles */
.condition-tooltip {
  position: fixed;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  line-height: 1.4;
  max-width: 300px;
  z-index: 1000;
  pointer-events: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  word-wrap: break-word;
  opacity: 0;
  animation: fadeInTooltip 0.2s ease-out forwards;
}

.tooltip-arrow {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid rgba(0, 0, 0, 0.9);
}

@keyframes fadeInTooltip {
  from {
    opacity: 0;
    transform: translate(-50%, -95%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -100%);
  }
}

/* New Treatment Styles */
.treatment-card-new {
  background: rgba(248, 250, 252, 0.9);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
}
.dark .treatment-card-new {
  background: rgba(30, 41, 59, 0.9);
  border-color: #475569;
}

.treatment-card-new:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.treatment-header-new {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-bottom: 1px solid #e2e8f0;
}
.dark .treatment-header-new {
  background: linear-gradient(135deg, #1e293b, #334155);
  border-bottom-color: #475569;
}

.treatment-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.treatment-info-new {
  flex: 1;
  min-width: 0;
}

.treatment-title-new {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
  line-height: 1.4;
}
.dark .treatment-title-new {
  color: #f1f5f9;
}

.treatment-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.treatment-type-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  background: #e0f2fe;
  color: #0369a1;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}
.dark .treatment-type-badge {
  background: #0c4a6e;
  color: #7dd3fc;
}

.treatment-cost {
  font-size: 0.875rem;
  color: #059669;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  background: rgba(5, 150, 105, 0.1);
  border-radius: 6px;
}
.dark .treatment-cost {
  color: #34d399;
  background: rgba(52, 211, 153, 0.1);
}

.treatment-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.treatment-content-new {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.5);
}
.dark .treatment-content-new {
  background: rgba(15, 23, 42, 0.5);
}

.treatment-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .treatment-form-grid {
    grid-template-columns: 1fr;
  }
}

/* Treatment Steps - New Design */
.treatment-steps-new {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}
.dark .treatment-steps-new {
  background: rgba(15, 23, 42, 0.8);
  border-color: #475569;
}

.steps-header-new {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.steps-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}
.dark .steps-title {
  color: #f1f5f9;
}

.steps-list-new {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step-item-new {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 0.75rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.step-item-new.active-step {
  background-color: #f0f9ff;
  border: 2px solid #0ea5e9;
}

.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
  margin-top: 0.5rem;
  position: relative;
}

.step-indicator.critical {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  animation: pulse-critical 2s infinite;
}

.critical-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #fbbf24;
  color: #92400e;
  font-size: 0.6rem;
  font-weight: 700;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid white;
}

@keyframes pulse-critical {
  0% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(239, 68, 68, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
}

.step-content-new {
  flex: 1;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.step-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.step-input {
  font-size: 0.875rem;
}

.step-details-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-start;
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f8fafc;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
}

.date-picker-container {
  flex: 1;
  min-width: 200px;
}

/* Critical Section Styles */
.critical-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background-color: #fef2f2;
  min-width: 120px;
}

.critical-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  border-radius: 24px;
  transition: .3s;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  transition: .3s;
}

input:checked + .toggle-slider {
  background-color: #ef4444;
}

input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.toggle-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.days-input {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.days-field {
  width: 60px !important;
  padding: 0.25rem 0.5rem !important;
  font-size: 0.875rem !important;
  text-align: center;
}

.days-label {
  font-size: 0.875rem;
  color: #6b7280;
}

@media (max-width: 640px) {
  .step-details-row {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .date-picker-container {
    min-width: auto;
    width: 100%;
  }
  
  .critical-section,
  .follow-up-section {
    min-width: auto;
    width: 100%;
  }
  
  .step-status-badges {
    min-width: auto;
    justify-content: center;
  }
}

/* Follow-up Section Styles */
.follow-up-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background-color: #f0f9ff;
  min-width: 120px;
}

.follow-up-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toggle-slider.follow-up {
  background-color: #cbd5e1;
}

input:checked + .toggle-slider.follow-up {
  background-color: #3b82f6;
}

.follow-up-options {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 100%;
  align-items: center;
}

.follow-up-status {
  padding: 0.25rem 0.5rem !important;
  font-size: 0.875rem !important;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  background-color: white;
}

.follow-up-date {
  font-size: 0.875rem;
}

.step-status-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: flex-start;
  flex: 1;
  min-width: 250px;
}

.step-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #374151;
}
.dark .step-status-badge {
  background: rgba(55, 65, 81, 0.9);
  border-color: #4b5563;
  color: #e5e7eb;
}

.step-status-badge:hover {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.step-status-badge.active {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #1e40af;
  font-weight: 600;
}
.dark .step-status-badge.active {
  background: linear-gradient(135deg, #1e3a8a, #1d4ed8);
  color: #dbeafe;
}

.step-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;
  flex-shrink: 0;
}
.step-remove:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: scale(1.05);
}
.dark .step-remove {
  background: rgba(153, 27, 27, 0.3);
  color: #fca5a5;
}
.dark .step-remove:hover {
  background: rgba(153, 27, 27, 0.4);
}

/* Dark mode for step details */
.dark .step-details-row {
  background-color: #1f2937;
  border-color: #374151;
}

.dark .critical-section {
  background-color: #7f1d1d;
  border-color: #991b1b;
}

.dark .follow-up-section {
  background-color: #1e3a8a;
  border-color: #1d4ed8;
}

.dark .toggle-label {
  color: #e5e7eb;
}

/* Cost Input */
.cost-input {
  display: flex;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.9);
}
.dark .cost-input {
  border-color: #4b5563;
  background: rgba(55, 65, 81, 0.9);
}

.currency-select {
  padding: 0.875rem 1rem;
  border: none;
  background: #f3f4f6;
  color: #374151;
  font-weight: 500;
  border-right: 1px solid #e5e7eb;
}
.dark .currency-select {
  background: #4b5563;
  color: #e5e7eb;
  border-right-color: #6b7280;
}

.cost-amount {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.875rem 1rem;
}
.cost-amount:focus {
  outline: none;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border: 2px dashed #cbd5e1;
  border-radius: 16px;
}
.dark .empty-state {
  background: linear-gradient(135deg, #1e293b, #334155);
  border-color: #475569;
}

.empty-icon {
  color: #9ca3af;
  margin-bottom: 1rem;
}
.dark .empty-icon {
  color: #6b7280;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}
.dark .empty-title {
  color: #e5e7eb;
}

.empty-description {
  color: #6b7280;
  margin-bottom: 1.5rem;
}
.dark .empty-description {
  color: #9ca3af;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  cursor: pointer;
  font-size: 0.875rem;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border-color: #3b82f6;
}
.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.25);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.9);
  color: #374151;
  border-color: #d1d5db;
}
.dark .btn-secondary {
  background: rgba(55, 65, 81, 0.9);
  color: #e5e7eb;
  border-color: #4b5563;
}
.btn-secondary:hover:not(:disabled) {
  background: rgba(249, 250, 251, 1);
  border-color: #9ca3af;
}
.dark .btn-secondary:hover:not(:disabled) {
  background: rgba(75, 85, 99, 1);
}

.btn-outline {
  background: transparent;
  color: #6b7280;
  border-color: #d1d5db;
}
.dark .btn-outline {
  color: #9ca3af;
  border-color: #4b5563;
}
.btn-outline:hover:not(:disabled) {
  background: rgba(249, 250, 251, 0.5);
  border-color: #9ca3af;
}
.dark .btn-outline:hover:not(:disabled) {
  background: rgba(55, 65, 81, 0.5);
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
}

.btn-icon {
  background: none;
  border: none;
  padding: 0.5rem;
  color: #6b7280;
  border-radius: 8px;
  transition: all 0.2s ease;
}
.dark .btn-icon {
  color: #9ca3af;
}
.btn-icon:hover {
  color: #374151;
  background: rgba(243, 244, 246, 0.5);
}
.dark .btn-icon:hover {
  color: #e5e7eb;
  background: rgba(55, 65, 81, 0.5);
}

.btn-danger {
  color: #dc2626;
}
.btn-danger:hover {
  color: #991b1b;
  background: rgba(254, 226, 226, 0.5);
}
.dark .btn-danger:hover {
  background: rgba(153, 27, 27, 0.5);
}

/* Floating Actions */
.floating-actions {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  z-index: 50;
  max-width: 400px;
}
.dark .floating-actions {
  background: rgba(30, 41, 59, 0.95);
  border-color: #475569;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

/* Alert Styles */
.alert {
  display: flex;
  align-items: center;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  font-size: 0.875rem;
  border: 1px solid;
}
.alert-error {
  background: rgba(254, 226, 226, 0.8);
  color: #991b1b;
  border-color: #fca5a5;
}
.dark .alert-error {
  background: rgba(153, 27, 27, 0.3);
  color: #fca5a5;
  border-color: #991b1b;
}
.alert-icon {
  margin-right: 0.75rem;
  flex-shrink: 0;
}
.alert-close {
  margin-left: auto;
  padding: 0.25rem;
  background: none;
  border: none;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  border-radius: 4px;
}
.alert-close:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.1);
}

/* Transitions */
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.treatment-list-move,
.step-list-move,
.treatment-list-enter-active,
.treatment-list-leave-active,
.step-list-enter-active,
.step-list-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.treatment-list-enter-from,
.treatment-list-leave-to,
.step-list-enter-from,
.step-list-leave-to {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

/* Responsive Design */
@media (max-width: 768px) {
  .record-detail-view-redesigned {
    padding: 1rem;
  }
  
  .layout-container {
    gap: 1rem;
    grid-template-columns: 1fr;
  }
  
  .navigation-sidebar {
    border-radius: 12px;
    padding: 1rem;
    order: -1;
  }
  
  .nav-menu {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
  
  .nav-item {
    padding: 0.75rem 0.5rem;
    font-size: 0.75rem;
    text-align: center;
  }
  
  .nav-item span {
    display: none;
  }
  
  .section-header {
    padding: 1rem 1.5rem;
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  
  .section-content {
    padding: 1rem 1.5rem;
  }
  
  .status-options-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .condition-visual-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
  }
  
  .section-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1rem;
  }
  
  .overall-progress {
    order: -1;
  }
  
  .step-status-badges {
    justify-content: center;
  }
  
  .step-status-badge {
    font-size: 0.6875rem;
    padding: 0.25rem 0.5rem;
  }
  
  .top-overview-section {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .treatment-header-new {
    padding: 1rem;
    flex-wrap: wrap;
  }
  
  .treatment-actions {
    width: 100%;
    justify-content: flex-end;
    margin-top: 0.5rem;
  }
  
  .floating-actions {
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}

/* Extra small screens */
@media (max-width: 480px) {
  .condition-visual-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .nav-menu {
    grid-template-columns: 1fr;
  }
  
  .treatment-number {
    width: 28px;
    height: 28px;
    font-size: 0.75rem;
  }
  
  .step-details-row {
    grid-template-columns: 1fr;
  }
  
  .step-status-badges {
    grid-template-columns: repeat(2, 1fr);
    display: grid;
  }
  
  .overall-progress .progress-circle {
    transform: scale(0.8);
  }
  
  .status-options-grid {
    grid-template-columns: 1fr;
  }
}

/* Additional enhancements */
html {
  scroll-behavior: smooth;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.section-icon:hover {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}

::selection {
  background: rgba(59, 130, 246, 0.2);
  color: #1e293b;
}
.dark ::selection {
  background: rgba(147, 197, 253, 0.3);
  color: #f1f5f9;
}

/* Suggested Steps Styles */
.suggestion-controls {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.suggested-steps-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.suggested-step-tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #475569;
}

.suggested-step-tag:hover {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

/* Step Description with Tags Inside */
.step-description-with-tags {
  width: 100%;
}

.description-tags-container {
  display: flex;
  flex-direction: column;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  min-height: 60px;
  padding: 8px;
  gap: 6px;
  transition: border-color 0.2s ease;
}

.description-tags-container:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.tags-in-input {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-height: 20px;
}

.tag-in-input {
  display: inline-flex;
  align-items: center;
  padding: 3px 6px;
  background: #3b82f6;
  border: 1px solid #3b82f6;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  gap: 4px;
  max-width: 200px;
  transition: all 0.2s ease;
}

.tag-in-input:hover {
  background: #2563eb;
  border-color: #2563eb;
}

.tag-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.tag-remove-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.tag-remove-btn:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: scale(1.1);
}

.description-input-with-tags {
  border: none;
  outline: none;
  background: transparent;
  padding: 4px 0;
  font-size: 14px;
  color: #374151;
  width: 100%;
  min-height: 24px;
}

.description-input-with-tags::placeholder {
  color: #9ca3af;
  font-style: italic;
}

/* Empty state styling */
.description-tags-container:not(:focus-within) .description-input-with-tags:placeholder-shown {
  color: #6b7280;
}

.description-tags-container:empty::before {
  content: "Click to add tags or type description";
  color: #9ca3af;
  font-style: italic;
  font-size: 14px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .description-tags-container {
    padding: 6px;
    min-height: 50px;
  }
  
  .tags-in-input {
    gap: 3px;
  }
  
  .tag-in-input {
    font-size: 11px;
    padding: 2px 5px;
    max-width: 150px;
  }
  
  .tag-remove-btn {
    width: 10px;
    height: 10px;
  }
  
  .description-input-with-tags {
    font-size: 13px;
  }
}

.form-helper-text {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 8px;
}

/* Dark mode support */
.dark .suggested-step-tag {
  background: #1e293b;
  border-color: #334155;
  color: #cbd5e1;
}

.dark .suggested-step-tag:hover {
  background: #334155;
  border-color: #475569;
}

.dark .description-tags-container {
  background: #1e293b;
  border-color: #334155;
}

.dark .description-tags-container:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.dark .tag-in-input {
  background: #3b82f6;
  border-color: #3b82f6;
}

.dark .tag-in-input:hover {
  background: #2563eb;
  border-color: #2563eb;
}

.dark .description-input-with-tags {
  color: #cbd5e1;
}

.dark .description-input-with-tags::placeholder {
  color: #64748b;
}

.dark .suggested-step-tag:hover {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.dark .step-tags-container {
  background: #1e293b;
  border-color: #334155;
}

.dark .form-helper-text {
  color: #94a3b8;
}

/* Treatment Name Suggestions Styles */
.treatment-name-input-container {
  position: relative;
  width: 100%;
}

.treatment-name-input {
  width: 100%;
}

.treatment-suggestions-dropdown {
  position: absolute;
  z-index: 20;
  width: 100%;
  margin: 4px 0 0;
  padding: 4px 0;
  list-style: none;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  max-height: 280px;
  overflow-y: auto;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.treatment-suggestion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.treatment-suggestion-item:hover {
  background: #f3f4f6;
}

.treatment-suggestion-item .suggestion-text {
  flex: 1;
  font-size: 14px;
  color: #374151;
}

.treatment-suggestion-item .suggestion-category {
  font-size: 12px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
}

/* Dark mode for treatment suggestions */
.dark .treatment-suggestions-dropdown {
  background: #1f2937;
  border-color: #374151;
}

.dark .treatment-suggestion-item:hover {
  background: #374151;
}

.dark .treatment-suggestion-item .suggestion-text {
  color: #d1d5db;
}

.dark .treatment-suggestion-item .suggestion-category {
  background: #374151;
  color: #9ca3af;
}
</style>
