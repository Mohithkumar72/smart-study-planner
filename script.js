/* ==========================================================
   SMART STUDY PLANNER - JAVASCRIPT
   A beginner-friendly script managing study subjects,
   priority calculation, task completion, dashboard statistics,
   and persistent browser storage (localStorage).
   ========================================================== */

// -----------------------------------------------------------
// 1. GLOBAL STATE & LOCAL STORAGE SETUP
// -----------------------------------------------------------

/*
   WHAT IS LOCALSTORAGE?
   localStorage is a built-in browser feature that allows web apps
   to save data directly on the user's computer.
   - It only stores data as text (strings).
   - JSON.stringify() converts a JavaScript array/object into a string.
   - JSON.parse() converts the saved string back into a JavaScript array/object.
   - Data stored in localStorage does not disappear when you refresh or close the browser!
*/
const STORAGE_KEY = "smart_study_planner_subjects";

// Load saved subjects from localStorage, or start with an empty array if none exist
let subjects = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// -----------------------------------------------------------
// 2. DOM ELEMENT REFERENCES
// -----------------------------------------------------------
// Form and inputs
const subjectForm = document.getElementById("subject-form");
const subjectNameInput = document.getElementById("subject-name");
const examDateInput = document.getElementById("exam-date");
const difficultyInput = document.getElementById("difficulty");
const studyHoursInput = document.getElementById("study-hours");

// Subject list container and empty state
const subjectList = document.getElementById("subject-list");
const emptyState = document.getElementById("empty-state");

// Dashboard summary elements
const totalSubjectsEl = document.getElementById("total-subjects");
const pendingSubjectsEl = document.getElementById("pending-subjects");
const completedSubjectsEl = document.getElementById("completed-subjects");
const totalHoursEl = document.getElementById("total-hours");

// Set minimum selectable date in date picker to today
const todayString = new Date().toISOString().split("T")[0];
examDateInput.min = todayString;

// -----------------------------------------------------------
// 3. HELPER FUNCTIONS
// -----------------------------------------------------------

/**
 * Saves the current 'subjects' array into localStorage.
 */
function saveSubjectsToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
}

/**
 * Calculates the number of days remaining until the exam.
 * Returns an integer number of days.
 */
function calculateDaysRemaining(examDateString) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to midnight for accurate day comparison

  const examDate = new Date(examDateString);
  examDate.setHours(0, 0, 0, 0);

  // Time difference in milliseconds
  const timeDifference = examDate.getTime() - today.getTime();

  // Convert milliseconds into days: (ms / 1000s / 60m / 60h / 24d)
  const days = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
  return days;
}

/**
 * Formats the days remaining into a human-friendly string.
 */
function formatDaysRemaining(days) {
  if (days < 0) {
    return "Exam Passed";
  } else if (days === 0) {
    return "Today!";
  } else if (days === 1) {
    return "1 day left";
  } else {
    return `${days} days left`;
  }
}

/**
 * PRIORITY CALCULATION LOGIC:
 * Calculates subject priority ("High", "Medium", "Low") based on:
 * 1. Days remaining until exam (urgency)
 * 2. Difficulty level (Easy, Medium, Hard)
 * 3. Estimated study hours required
 */
function calculatePriority(daysRemaining, difficulty, studyHours) {
  let score = 0;

  // 1. Urgency based on exam date
  if (daysRemaining <= 3) {
    score += 3; // Very urgent (3 days or less)
  } else if (daysRemaining <= 7) {
    score += 2; // Moderate urgency (within a week)
  } else {
    score += 1; // Plenty of time
  }

  // 2. Difficulty weight
  if (difficulty === "Hard") {
    score += 3;
  } else if (difficulty === "Medium") {
    score += 2;
  } else {
    // Easy
    score += 1;
  }

  // 3. Study hours weight
  if (studyHours >= 10) {
    score += 2; // High study effort
  } else if (studyHours >= 5) {
    score += 1; // Moderate study effort
  } else {
    score += 0;
  }

  // Determine final priority level using conditional check
  if (score >= 6) {
    return "High";
  } else if (score >= 4) {
    return "Medium";
  } else {
    return "Low";
  }
}

// -----------------------------------------------------------
// 4. DASHBOARD STATISTICS UPDATE
// -----------------------------------------------------------
function updateDashboard() {
  const total = subjects.length;

  let completed = 0;
  let totalHours = 0;

  // Loop through subjects to calculate stats
  for (let i = 0; i < subjects.length; i++) {
    if (subjects[i].completed) {
      completed++;
    }
    totalHours += Number(subjects[i].hours);
  }

  const pending = total - completed;

  // Update text content in the HTML elements
  totalSubjectsEl.textContent = total;
  pendingSubjectsEl.textContent = pending;
  completedSubjectsEl.textContent = completed;
  totalHoursEl.textContent = `${totalHours} hrs`;
}

// -----------------------------------------------------------
// 5. RENDER SUBJECT CARDS TO THE DOM
// -----------------------------------------------------------
function renderSubjects() {
  // Clear the existing HTML list
  subjectList.innerHTML = "";

  // Show empty state if there are no subjects
  if (subjects.length === 0) {
    emptyState.style.display = "block";
    updateDashboard();
    return;
  }

  emptyState.style.display = "none";

  // Loop over each subject and build its card
  subjects.forEach(function (subject) {
    const daysLeft = calculateDaysRemaining(subject.examDate);
    const priority = calculatePriority(daysLeft, subject.difficulty, subject.hours);
    const isCompleted = subject.completed;

    // Determine badge CSS classes
    const difficultyClass = `badge-${subject.difficulty.toLowerCase()}`;
    let priorityClass = "badge-priority-low";
    if (priority === "High") {
      priorityClass = "badge-priority-high";
    } else if (priority === "Medium") {
      priorityClass = "badge-priority-med";
    }

    // Determine progress bar percentage
    const progressPercent = isCompleted ? 100 : 0;
    const progressStatusText = isCompleted ? "Completed (100%)" : "Pending (0%)";

    // Create the card container element
    const card = document.createElement("div");
    card.className = `subject-card ${isCompleted ? "is-completed" : ""}`;

    // Inject Card HTML structure
    card.innerHTML = `
      <div class="card-top">
        <h3 class="subject-title">${escapeHTML(subject.name)}</h3>
        <div class="badges">
          <span class="badge ${difficultyClass}">${subject.difficulty}</span>
          <span class="badge ${priorityClass}">Priority: ${priority}</span>
        </div>
      </div>

      <div class="card-details">
        <div class="detail-item">
          <span>📅</span>
          <span><strong>Exam:</strong> ${subject.examDate}</span>
        </div>
        <div class="detail-item">
          <span>⏳</span>
          <span><strong>Time:</strong> ${formatDaysRemaining(daysLeft)}</span>
        </div>
        <div class="detail-item">
          <span>⏱️</span>
          <span><strong>Plan:</strong> ${subject.hours} hrs</span>
        </div>
      </div>

      <div class="progress-section">
        <div class="progress-label-row">
          <span>Status</span>
          <span>${progressStatusText}</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width: ${progressPercent}%;"></div>
        </div>
      </div>

      <div class="card-actions">
        <button 
          class="btn btn-sm btn-toggle ${isCompleted ? 'active' : ''}" 
          onclick="toggleSubjectStatus(${subject.id})"
        >
          ${isCompleted ? "↩️ Mark as Pending" : "✅ Mark as Completed"}
        </button>
        <button 
          class="btn btn-sm btn-delete" 
          onclick="deleteSubject(${subject.id})"
        >
          🗑️ Delete
        </button>
      </div>
    `;

    // Append card to list
    subjectList.appendChild(card);
  });

  // Keep dashboard stats updated
  updateDashboard();
}

/**
 * Escapes special HTML characters to prevent text injection glitches.
 */
function escapeHTML(str) {
  const div = document.createElement("div");
  div.innerText = str;
  return div.innerHTML;
}

// -----------------------------------------------------------
// 6. ADD NEW SUBJECT HANDLER
// -----------------------------------------------------------
subjectForm.addEventListener("submit", function (event) {
  event.preventDefault(); // Stop page from reloading on form submit

  const name = subjectNameInput.value.trim();
  const examDate = examDateInput.value;
  const difficulty = difficultyInput.value;
  const hours = parseInt(studyHoursInput.value, 10);

  // Simple validation
  if (!name || !examDate || !difficulty || isNaN(hours) || hours <= 0) {
    alert("Please fill in all fields with valid information!");
    return;
  }

  // Create a new subject object
  const newSubject = {
    id: Date.now(), // Unique ID using current timestamp
    name: name,
    examDate: examDate,
    difficulty: difficulty,
    hours: hours,
    completed: false
  };

  // Add new subject to our array
  subjects.push(newSubject);

  // Save to localStorage and re-render
  saveSubjectsToStorage();
  renderSubjects();

  // Reset form inputs
  subjectForm.reset();
  subjectNameInput.focus();
});

// -----------------------------------------------------------
// 7. TOGGLE COMPLETION STATUS
// -----------------------------------------------------------
function toggleSubjectStatus(id) {
  // Find subject by its unique id
  for (let i = 0; i < subjects.length; i++) {
    if (subjects[i].id === id) {
      // Toggle true/false status
      subjects[i].completed = !subjects[i].completed;
      break;
    }
  }

  // Save changes and update display
  saveSubjectsToStorage();
  renderSubjects();
}

// -----------------------------------------------------------
// 8. DELETE SUBJECT
// -----------------------------------------------------------
function deleteSubject(id) {
  const confirmDelete = confirm("Are you sure you want to remove this subject from your study plan?");
  if (!confirmDelete) return;

  // Filter out the subject with matching id
  subjects = subjects.filter(function (subject) {
    return subject.id !== id;
  });

  // Save changes and update display
  saveSubjectsToStorage();
  renderSubjects();
}

// -----------------------------------------------------------
// 9. INITIAL LOAD
// -----------------------------------------------------------
// Render initial subjects on page load (either saved ones or empty state)
renderSubjects();
