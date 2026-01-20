// Step Back - Main Application

const App = {
    currentPin: null,
    entries: [],
    settings: {},
    currentMonthOffset: 0,
    editingEntryDate: null,
    currentTrack: 'overfunctioning', // 'overfunctioning' or 'avoidant'

    // Track definitions
    tracks: {
        overfunctioning: {
            name: 'Overfunctioning',
            question: 'Did you practice stepping back today?',
            yesLabel: 'Stepped back',
            noLabel: 'Did not step back',
            description: 'Track progress on stepping back from overfunctioning patterns',
            icon: '↓',
            iconYes: '↓',
            iconNo: '↓'
        },
        avoidant: {
            name: 'Fearful-Avoidant',
            question: 'Did you practice staying present today?',
            yesLabel: 'Stayed present',
            noLabel: 'Did not stay present',
            description: 'Track progress on staying present in relationships despite fear',
            icon: '♥',
            iconYes: '♥',
            iconNo: '♥'
        }
    },

    // Fearful-Avoidant attachment practices (for committed relationship)
    avoidantPractices: {
        0: { // Sunday
            key: 'weekend',
            title: 'Weekend - Self-Soothing Practice',
            desc: 'Calm your nervous system when activated, without seeking reassurance or withdrawing from Charlie',
            examples: [
                'When feeling anxious, use grounding (5 senses, deep breathing) before bringing it to Charlie',
                'Journal about what you\'re feeling first - distinguish old wounds from current reality'
            ]
        },
        1: { // Monday
            key: 'monday',
            title: 'Monday - Notice the Urge to Withdraw',
            desc: 'When you feel the pull to create distance from Charlie, pause and name the trigger',
            examples: [
                'Charlie says something loving → you feel urge to pick a fight or go cold. Pause. Name it: "I\'m feeling vulnerable"',
                'After closeness, you want space. Notice: "Intimacy is activating my nervous system, not a real threat"'
            ]
        },
        2: { // Tuesday
            key: 'tuesday',
            title: 'Tuesday - Stay 10% Longer',
            desc: 'When closeness with Charlie feels uncomfortable, stay slightly longer instead of escaping',
            examples: [
                'During a vulnerable conversation, resist the urge to change the subject or make a joke',
                'When Charlie shows affection, stay present for a few more seconds instead of pulling away or deflecting'
            ]
        },
        3: { // Wednesday
            key: 'wednesday',
            title: 'Wednesday - Ask Directly (No Testing)',
            desc: 'Express a need to Charlie clearly instead of hinting, testing, or expecting mind-reading',
            examples: [
                'Instead of withdrawing to see if Charlie chases you, say "I need some reassurance right now"',
                'Replace "It\'s fine, do whatever you want" with "I\'d really like it if we spent time together tonight"'
            ]
        },
        4: { // Thursday
            key: 'thursday',
            title: 'Thursday - Reality-Check the Threat',
            desc: 'When triggered, ask: "Is this about Charlie now, or am I reacting to an old wound?"',
            examples: [
                'Charlie seems distant → Before assuming rejection, ask: "Could something else be going on for them?"',
                'You feel criticized → Pause: "Is Charlie actually attacking me, or am I hearing my past?"'
            ]
        },
        5: { // Friday
            key: 'friday',
            title: 'Friday - Receive Without Sabotaging',
            desc: 'When Charlie shows love, let it in without deflecting, dismissing, or creating conflict',
            examples: [
                'Charlie compliments you → Say "thank you, that means a lot" and sit with it, don\'t undermine it',
                'Charlie plans something special → Receive it without finding flaws or pushing them away'
            ]
        },
        6: { // Saturday
            key: 'weekend',
            title: 'Weekend - Self-Soothing Practice',
            desc: 'Calm your nervous system when activated, without seeking reassurance or withdrawing from Charlie',
            examples: [
                'When feeling anxious, use grounding (5 senses, deep breathing) before bringing it to Charlie',
                'Journal about what you\'re feeling first - distinguish old wounds from current reality'
            ]
        }
    },

    // Overfunctioning practices (original)
    overfunctioningPractices: {
        0: { // Sunday
            key: 'weekend',
            title: 'Weekend - Rest Without Earning It',
            desc: 'Do something restful without completing your to-do list first',
            examples: [
                'Watch a show or nap while dishes are in the sink or laundry is unfolded',
                'Say "I\'m resting today" without justifying it with how hard you worked'
            ]
        },
        1: { // Monday
            key: 'monday',
            title: 'Monday - Pause Practice',
            desc: 'Set 3 reminders to notice overfunctioning moments',
            examples: [
                'You start rewriting a coworker\'s email "to help" before they even ask',
                'You jump in to explain something for someone mid-sentence'
            ]
        },
        2: { // Tuesday
            key: 'tuesday',
            title: 'Tuesday - "Not My Circus"',
            desc: 'Practice letting someone else handle their own responsibility',
            examples: [
                'A friend complains about a problem - listen without offering solutions',
                'A family member is running late for their appointment - resist reminding them'
            ]
        },
        3: { // Wednesday
            key: 'wednesday',
            title: 'Wednesday - Schedule Personal Time',
            desc: 'Block 30 minutes for something you want (non-negotiable)',
            examples: [
                'Block 30 min labeled "busy" - walk, read, or do nothing',
                'Take a full lunch break away from your desk without checking messages'
            ]
        },
        4: { // Thursday
            key: 'thursday',
            title: 'Thursday - Practice "Good Enough"',
            desc: 'Do one task at 80% instead of 100%',
            examples: [
                'Send an email without re-reading it 3 times - one quick proof and send',
                'Leave a room 80% tidy, or submit work without one final polish pass'
            ]
        },
        5: { // Friday
            key: 'friday',
            title: 'Friday - No Automatic Yes',
            desc: 'Pause 10 seconds before responding to requests, say no to one thing',
            examples: [
                '"Can you help with X?" → "Let me check and get back to you"',
                'Decline one optional meeting, social invite, or favor'
            ]
        },
        6: { // Saturday
            key: 'weekend',
            title: 'Weekend - Rest Without Earning It',
            desc: 'Do something restful without completing your to-do list first',
            examples: [
                'Watch a show or nap while dishes are in the sink or laundry is unfolded',
                'Say "I\'m resting today" without justifying it with how hard you worked'
            ]
        }
    },

    // Get practices for current track
    get practices() {
        return this.currentTrack === 'avoidant' ? this.avoidantPractices : this.overfunctioningPractices;
    },

    // Initialize the app
    async init() {
        this.loadTrack();
        this.bindEvents();
        await this.checkSetup();
        this.registerServiceWorker();
    },

    // Load saved track preference
    loadTrack() {
        const saved = localStorage.getItem('stepback_track');
        if (saved && this.tracks[saved]) {
            this.currentTrack = saved;
        }
        this.updateTrackUI();
    },

    // Save track preference
    saveTrack() {
        localStorage.setItem('stepback_track', this.currentTrack);
    },

    // Switch track
    switchTrack(track) {
        if (this.tracks[track]) {
            this.currentTrack = track;
            this.saveTrack();
            this.updateTrackUI();
            this.renderCheckin();
        }
    },

    // Update UI elements based on current track
    updateTrackUI() {
        // Update track selector buttons
        document.querySelectorAll('.track-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.track === this.currentTrack);
        });

        // Update track-specific content visibility
        const isAvoidant = this.currentTrack === 'avoidant';
        document.querySelectorAll('.overfunctioning-content').forEach(el => {
            el.style.display = isAvoidant ? 'none' : 'block';
        });
        document.querySelectorAll('.avoidant-content').forEach(el => {
            el.style.display = isAvoidant ? 'block' : 'none';
        });
    },

    // Check if app is set up
    async checkSetup() {
        const pinHash = localStorage.getItem('stepback_pin_hash');
        if (!pinHash) {
            this.showScreen('setup-screen');
        } else {
            this.showScreen('lock-screen');
        }
    },

    // Show specific screen
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    },

    // Show specific view
    showView(viewId) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(viewId + '-view').classList.add('active');
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`[data-view="${viewId}"]`).classList.add('active');

        if (viewId === 'checkin') this.renderCheckin();
        if (viewId === 'patterns') this.renderPatterns();
        if (viewId === 'history') this.renderHistory();
    },

    // Bind all event listeners
    bindEvents() {
        // Lock screen PIN pad
        document.querySelector('#lock-screen .pin-pad').addEventListener('click', (e) => {
            if (e.target.classList.contains('pin-btn')) {
                this.handleLockPinInput(e.target.dataset.num);
            }
        });

        // Setup screen PIN pad
        document.querySelector('#setup-screen .pin-pad').addEventListener('click', (e) => {
            if (e.target.classList.contains('pin-btn')) {
                this.handleSetupPinInput(e.target.dataset.num);
            }
        });

        // Track switcher
        document.querySelectorAll('.track-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchTrack(btn.dataset.track);
            });
        });

        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showView(btn.dataset.view);
            });
        });

        // Check-in buttons
        document.getElementById('btn-yes').addEventListener('click', () => this.doCheckin(true));
        document.getElementById('btn-no').addEventListener('click', () => this.doCheckin(false));

        // Quick note character count
        document.getElementById('quick-note').addEventListener('input', (e) => {
            document.getElementById('char-count').textContent = e.target.value.length;
        });

        // Edit today's checkin
        document.getElementById('edit-checkin').addEventListener('click', () => {
            const today = this.formatDate(new Date());
            this.openEditModal(today);
        });

        // Expand reflection
        document.getElementById('expand-reflection').addEventListener('click', () => {
            const content = document.getElementById('reflection-content');
            const icon = document.getElementById('expand-icon');
            content.classList.toggle('expanded');
            icon.classList.toggle('rotated');
        });

        // Info buttons for "Why this works"
        document.querySelectorAll('.info-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const practice = btn.dataset.practice;
                const whySection = document.getElementById('why-' + practice);
                if (whySection) {
                    whySection.classList.toggle('visible');
                }
            });
        });

        // Save practices
        document.getElementById('save-practices').addEventListener('click', () => this.savePractices());

        // Month navigation
        document.getElementById('prev-month').addEventListener('click', () => {
            this.currentMonthOffset--;
            this.renderPatterns();
        });
        document.getElementById('next-month').addEventListener('click', () => {
            if (this.currentMonthOffset < 0) {
                this.currentMonthOffset++;
                this.renderPatterns();
            }
        });

        // History filters
        document.getElementById('history-filter').addEventListener('change', () => this.renderHistory());
        document.getElementById('history-search').addEventListener('input', () => this.renderHistory());

        // Export buttons
        document.getElementById('export-json').addEventListener('click', () => this.exportJSON());
        document.getElementById('export-csv').addEventListener('click', () => this.exportCSV());

        // Settings
        document.getElementById('change-pin').addEventListener('click', () => this.openPinChangeModal());
        document.getElementById('export-backup').addEventListener('click', () => this.exportBackup());
        document.getElementById('import-backup').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });
        document.getElementById('import-file').addEventListener('change', (e) => this.importBackup(e));
        document.getElementById('clear-data').addEventListener('click', () => this.confirmClearData());
        document.getElementById('refresh-app').addEventListener('click', () => this.refreshApp());

        // Edit modal
        document.getElementById('modal-yes').addEventListener('click', () => {
            document.getElementById('modal-yes').classList.add('selected');
            document.getElementById('modal-no').classList.remove('selected');
        });
        document.getElementById('modal-no').addEventListener('click', () => {
            document.getElementById('modal-no').classList.add('selected');
            document.getElementById('modal-yes').classList.remove('selected');
        });
        document.getElementById('modal-cancel').addEventListener('click', () => this.closeModal('edit-modal'));
        document.getElementById('modal-save').addEventListener('click', () => this.saveEditedEntry());

        // Confirm modal
        document.getElementById('confirm-cancel').addEventListener('click', () => this.closeModal('confirm-modal'));

        // PIN change modal
        document.getElementById('pin-modal-cancel').addEventListener('click', () => this.closeModal('pin-modal'));
        document.querySelector('#pin-modal .pin-pad').addEventListener('click', (e) => {
            if (e.target.classList.contains('pin-btn')) {
                this.handlePinChangeInput(e.target.dataset.num);
            }
        });
    },

    // PIN input handlers
    lockPinValue: '',
    setupPinValue: '',
    setupConfirmValue: '',
    setupStep: 'create',
    pinChangeStep: 'current',
    pinChangeValue: '',
    newPinValue: '',

    handleLockPinInput(num) {
        if (num === 'clear') {
            this.lockPinValue = this.lockPinValue.slice(0, -1);
        } else if (num === 'enter') {
            if (this.lockPinValue.length === 6) {
                this.verifyPin();
            }
            return;
        } else if (this.lockPinValue.length < 6) {
            this.lockPinValue += num;
        }
        this.updatePinDots('#lock-screen .pin-display', this.lockPinValue.length);

        // Auto-submit when 6 digits entered
        if (this.lockPinValue.length === 6) {
            setTimeout(() => this.verifyPin(), 100);
        }
    },

    handleSetupPinInput(num) {
        if (this.setupStep === 'create') {
            if (num === 'clear') {
                this.setupPinValue = this.setupPinValue.slice(0, -1);
            } else if (num === 'enter') {
                if (this.setupPinValue.length === 6) {
                    this.setupStep = 'confirm';
                    document.getElementById('setup-step').textContent = 'Confirm PIN';
                    this.updatePinDots('#setup-screen .pin-display', 0);
                }
                return;
            } else if (this.setupPinValue.length < 6) {
                this.setupPinValue += num;
            }
            this.updatePinDots('#setup-screen .pin-display', this.setupPinValue.length);
        } else {
            if (num === 'clear') {
                this.setupConfirmValue = this.setupConfirmValue.slice(0, -1);
            } else if (num === 'enter') {
                if (this.setupConfirmValue.length === 6) {
                    this.completeSetup();
                }
                return;
            } else if (this.setupConfirmValue.length < 6) {
                this.setupConfirmValue += num;
            }
            this.updatePinDots('#setup-screen .pin-display', this.setupConfirmValue.length);

            // Auto-submit when 6 digits entered
            if (this.setupConfirmValue.length === 6) {
                setTimeout(() => this.completeSetup(), 100);
            }
        }
    },

    handlePinChangeInput(num) {
        if (num === 'clear') {
            this.pinChangeValue = this.pinChangeValue.slice(0, -1);
        } else if (num === 'enter') {
            this.processPinChange();
            return;
        } else if (this.pinChangeValue.length < 6) {
            this.pinChangeValue += num;
        }
        this.updatePinDots('#pin-modal .pin-display', this.pinChangeValue.length);

        if (this.pinChangeValue.length === 6) {
            setTimeout(() => this.processPinChange(), 100);
        }
    },

    updatePinDots(selector, count) {
        const dots = document.querySelectorAll(selector + ' .pin-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('filled', i < count);
        });
    },

    async verifyPin() {
        const storedHash = JSON.parse(localStorage.getItem('stepback_pin_hash'));
        const isValid = await CryptoUtils.verifyPin(this.lockPinValue, storedHash);

        if (isValid) {
            this.currentPin = this.lockPinValue;
            this.lockPinValue = '';
            this.updatePinDots('#lock-screen .pin-display', 0);
            await this.loadData();
            this.loadSettings();
            this.showScreen('app-screen');
            this.showView('checkin');
        } else {
            document.getElementById('lock-message').textContent = 'Incorrect PIN. Try again.';
            this.lockPinValue = '';
            this.updatePinDots('#lock-screen .pin-display', 0);
        }
    },

    async completeSetup() {
        if (this.setupPinValue !== this.setupConfirmValue) {
            document.getElementById('setup-step').textContent = 'PINs do not match. Try again.';
            this.setupStep = 'create';
            this.setupPinValue = '';
            this.setupConfirmValue = '';
            this.updatePinDots('#setup-screen .pin-display', 0);
            return;
        }

        const pinHash = await CryptoUtils.hashPin(this.setupPinValue);
        localStorage.setItem('stepback_pin_hash', JSON.stringify(pinHash));

        this.currentPin = this.setupPinValue;
        this.entries = [];
        await this.saveData();

        this.setupPinValue = '';
        this.setupConfirmValue = '';
        this.setupStep = 'create';

        this.showScreen('app-screen');
        this.showView('checkin');
    },

    // Data management
    async loadData() {
        const encrypted = localStorage.getItem('stepback_data');
        if (encrypted) {
            const data = await CryptoUtils.decrypt(JSON.parse(encrypted), this.currentPin);
            if (data) {
                this.entries = data.entries || [];
                // Migrate old entries to new dual-track format
                this.migrateEntries();
            }
        }
    },

    // Migrate old single-track entries to dual-track format
    migrateEntries() {
        let needsSave = false;
        this.entries.forEach(entry => {
            // If entry has old format (steppedBack but no trackResponses)
            if (!entry.trackResponses) {
                entry.trackResponses = {
                    overfunctioning: {
                        response: entry.steppedBack,
                        note: entry.note || ''
                    },
                    avoidant: {
                        response: null,
                        note: ''
                    }
                };
                needsSave = true;
            }
        });
        if (needsSave) {
            this.saveData();
        }
    },

    // Get response for a specific track on a date
    getTrackResponse(entry, track) {
        if (!entry) return null;
        if (entry.trackResponses && entry.trackResponses[track]) {
            return entry.trackResponses[track].response;
        }
        // Fallback for old format
        if (track === 'overfunctioning') {
            return entry.steppedBack;
        }
        return null;
    },

    async saveData() {
        const data = { entries: this.entries };
        const encrypted = await CryptoUtils.encrypt(data, this.currentPin);
        localStorage.setItem('stepback_data', JSON.stringify(encrypted));
    },

    loadSettings() {
        const settings = localStorage.getItem('stepback_settings');
        if (settings) {
            this.settings = JSON.parse(settings);
        }
    },

    saveSettings() {
        localStorage.setItem('stepback_settings', JSON.stringify(this.settings));
    },

    // Check-in functionality
    formatDate(date) {
        // Use local date, not UTC (toISOString converts to UTC which can shift the day)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    formatDisplayDate(dateStr) {
        const date = new Date(dateStr + 'T12:00:00');
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric'
        });
    },

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    },

    getTodayEntry() {
        const today = this.formatDate(new Date());
        return this.entries.find(e => e.date === today);
    },

    renderCheckin() {
        const today = new Date();
        const track = this.tracks[this.currentTrack];

        document.getElementById('today-date').textContent = this.formatDisplayDate(this.formatDate(today));

        // Update question based on track
        document.getElementById('checkin-question').textContent = track.question;

        const todayEntry = this.getTodayEntry();
        const currentTrackResponse = this.getTrackResponse(todayEntry, this.currentTrack);

        if (currentTrackResponse !== null) {
            document.getElementById('quick-checkin').style.display = 'none';
            document.getElementById('checkin-done').style.display = 'block';
            document.getElementById('done-response').textContent =
                currentTrackResponse ? track.yesLabel : track.noLabel;

            const trackNote = todayEntry.trackResponses?.[this.currentTrack]?.note || todayEntry.note || '';
            document.getElementById('done-note').textContent = trackNote;

            // Load practices
            this.loadPracticesForToday(todayEntry);
        } else {
            document.getElementById('quick-checkin').style.display = 'block';
            document.getElementById('checkin-done').style.display = 'none';
            document.getElementById('quick-note').value = '';
            document.getElementById('char-count').textContent = '0';

            // Reset practices for current track
            this.resetPractices();
        }

        // Show today's practice
        this.renderTodaysPractice(today.getDay());

        // Update track UI and status indicators
        this.updateTrackUI();
        this.updateTrackStatusIndicators(todayEntry);
    },

    // Update the track selector to show check-in status
    updateTrackStatusIndicators(entry) {
        document.querySelectorAll('.track-btn').forEach(btn => {
            const track = btn.dataset.track;
            const response = this.getTrackResponse(entry, track);
            const indicator = btn.querySelector('.track-status-indicator');

            if (indicator) {
                if (response === true) {
                    indicator.className = 'track-status-indicator checked-yes';
                    indicator.textContent = '✓';
                } else if (response === false) {
                    indicator.className = 'track-status-indicator checked-no';
                    indicator.textContent = '✗';
                } else {
                    indicator.className = 'track-status-indicator';
                    indicator.textContent = '○';
                }
            }
        });
    },

    renderTodaysPractice(dayOfWeek) {
        const practice = this.practices[dayOfWeek];
        document.getElementById('todays-practice-title').textContent = practice.title;
        document.getElementById('todays-practice-desc').textContent = practice.desc;

        const examplesList = document.getElementById('todays-examples-list');
        examplesList.innerHTML = practice.examples.map(ex => `<li>${ex}</li>`).join('');
    },

    async doCheckin(response) {
        const today = this.formatDate(new Date());
        const note = document.getElementById('quick-note').value.trim();

        let entry = this.entries.find(e => e.date === today);

        if (!entry) {
            entry = {
                date: today,
                timestamp: new Date().toISOString(),
                steppedBack: null, // Keep for backward compatibility
                note: '',
                practices: {},
                trackResponses: {
                    overfunctioning: { response: null, note: '' },
                    avoidant: { response: null, note: '' }
                }
            };
            this.entries.push(entry);
        }

        // Ensure trackResponses exists
        if (!entry.trackResponses) {
            entry.trackResponses = {
                overfunctioning: { response: null, note: '' },
                avoidant: { response: null, note: '' }
            };
        }

        // Update the current track's response
        entry.trackResponses[this.currentTrack] = {
            response: response,
            note: note
        };

        // Update timestamp
        entry.timestamp = new Date().toISOString();

        // Keep backward compatibility - use overfunctioning as the main steppedBack
        entry.steppedBack = entry.trackResponses.overfunctioning.response;
        entry.note = entry.trackResponses.overfunctioning.note;

        await this.saveData();
        this.showToast(`${this.tracks[this.currentTrack].name} check-in saved`);
        this.renderCheckin();
    },

    loadPracticesForToday(entry) {
        document.querySelectorAll('.practice-checkbox').forEach(cb => {
            cb.checked = entry.practices && entry.practices[cb.dataset.practice];
        });
        document.querySelectorAll('.practice-note').forEach(input => {
            input.value = (entry.practices && entry.practices[input.dataset.practice + '_note']) || '';
        });
    },

    resetPractices() {
        document.querySelectorAll('.practice-checkbox').forEach(cb => cb.checked = false);
        document.querySelectorAll('.practice-note').forEach(input => input.value = '');
    },

    async savePractices() {
        const today = this.formatDate(new Date());
        let entry = this.entries.find(e => e.date === today);

        if (!entry) {
            // Create entry if doesn't exist
            entry = {
                date: today,
                timestamp: new Date().toISOString(),
                steppedBack: null,
                note: '',
                practices: {}
            };
            this.entries.push(entry);
        }

        entry.practices = {};
        document.querySelectorAll('.practice-checkbox').forEach(cb => {
            entry.practices[cb.dataset.practice] = cb.checked;
        });
        document.querySelectorAll('.practice-note').forEach(input => {
            if (input.value.trim()) {
                entry.practices[input.dataset.practice + '_note'] = input.value.trim();
            }
        });

        await this.saveData();
        this.showToast('Practices saved');
    },

    // Patterns view
    renderPatterns() {
        const grid = document.getElementById('calendar-grid');
        grid.innerHTML = '';

        const today = new Date();

        // Get the month to display
        const displayDate = new Date(today.getFullYear(), today.getMonth() + this.currentMonthOffset, 1);
        const year = displayDate.getFullYear();
        const month = displayDate.getMonth();

        // First day of month and number of days
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        const startingDayOfWeek = firstDayOfMonth.getDay();

        // Month label
        const monthName = displayDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        document.getElementById('month-label').textContent = monthName;

        // Disable next button if at current month
        document.getElementById('next-month').disabled = this.currentMonthOffset >= 0;

        // Day headers
        const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        dayNames.forEach(name => {
            const header = document.createElement('div');
            header.className = 'calendar-day-header';
            header.textContent = name;
            grid.appendChild(header);
        });

        // Empty cells before first day
        for (let i = 0; i < startingDayOfWeek; i++) {
            const emptyEl = document.createElement('div');
            emptyEl.className = 'calendar-day empty';
            grid.appendChild(emptyEl);
        }

        // Days of the month - track stats for both tracks
        let overfunctioningCount = 0;
        let avoidantCount = 0;
        let totalDaysUpToToday = 0;

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = this.formatDate(date);
            const entry = this.entries.find(e => e.date === dateStr);

            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';

            const isToday = this.formatDate(today) === dateStr;
            const isFuture = date > today;

            if (isToday) dayEl.classList.add('today');
            if (isFuture) dayEl.classList.add('future');

            if (!isFuture) {
                totalDaysUpToToday++;
            }

            // Get responses for both tracks
            const overfunctioningResponse = this.getTrackResponse(entry, 'overfunctioning');
            const avoidantResponse = this.getTrackResponse(entry, 'avoidant');

            // Count check-ins
            if (!isFuture) {
                if (overfunctioningResponse !== null) overfunctioningCount++;
                if (avoidantResponse !== null) avoidantCount++;
            }

            // Build status icons for both tracks
            let statusHtml = '<span class="day-status dual-status">';

            // Overfunctioning icon (↓)
            if (overfunctioningResponse !== null) {
                statusHtml += `<span class="track-icon overfunctioning ${overfunctioningResponse ? 'yes' : 'no'}">↓</span>`;
            } else {
                statusHtml += '<span class="track-icon overfunctioning empty">○</span>';
            }

            // Avoidant icon (♥)
            if (avoidantResponse !== null) {
                statusHtml += `<span class="track-icon avoidant ${avoidantResponse ? 'yes' : 'no'}">♥</span>`;
            } else {
                statusHtml += '<span class="track-icon avoidant empty">○</span>';
            }

            statusHtml += '</span>';

            // Determine day background based on both responses
            const bothCheckedIn = overfunctioningResponse !== null && avoidantResponse !== null;
            const oneCheckedIn = overfunctioningResponse !== null || avoidantResponse !== null;

            if (bothCheckedIn) {
                dayEl.classList.add('both-checked');
            } else if (oneCheckedIn) {
                dayEl.classList.add('partial-checked');
            }

            dayEl.innerHTML = `
                <span class="day-num">${day}</span>
                ${statusHtml}
            `;

            if (!isFuture) {
                dayEl.addEventListener('click', () => this.openEditModal(dateStr));
            }

            grid.appendChild(dayEl);
        }

        // Summary for both tracks
        const totalDays = this.currentMonthOffset === 0 ? totalDaysUpToToday : daysInMonth;
        const summaryHtml = `
            <div class="dual-summary">
                <div class="summary-item">
                    <span class="summary-icon overfunctioning">↓</span>
                    <span>Overfunctioning: ${overfunctioningCount}/${totalDays} days</span>
                </div>
                <div class="summary-item">
                    <span class="summary-icon avoidant">♥</span>
                    <span>Fearful-Avoidant: ${avoidantCount}/${totalDays} days</span>
                </div>
            </div>
        `;

        document.getElementById('month-summary').innerHTML = summaryHtml;
    },

    // History view
    renderHistory() {
        const filter = document.getElementById('history-filter').value;
        const search = document.getElementById('history-search').value.toLowerCase();
        const list = document.getElementById('history-list');

        let filtered = [...this.entries].sort((a, b) => new Date(b.date) - new Date(a.date));

        // Apply date filter
        if (filter !== 'all') {
            const days = parseInt(filter);
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - days);
            filtered = filtered.filter(e => new Date(e.date) >= cutoff);
        }

        // Apply search filter
        if (search) {
            filtered = filtered.filter(e => {
                const noteMatch = e.note && e.note.toLowerCase().includes(search);
                const practiceMatch = e.practices && Object.keys(e.practices).some(k =>
                    k.endsWith('_note') && e.practices[k].toLowerCase().includes(search)
                );
                return noteMatch || practiceMatch;
            });
        }

        if (filtered.length === 0) {
            list.innerHTML = '<div class="history-empty">No entries found</div>';
            return;
        }

        list.innerHTML = filtered.map(entry => {
            const practices = entry.practices ? Object.keys(entry.practices)
                .filter(k => !k.endsWith('_note') && entry.practices[k])
                .map(k => this.getPracticeLabel(k)) : [];

            const timeStr = entry.timestamp ? this.formatTime(entry.timestamp) : '';

            // Get responses for both tracks
            const overfunctioningResponse = this.getTrackResponse(entry, 'overfunctioning');
            const avoidantResponse = this.getTrackResponse(entry, 'avoidant');

            // Get notes for both tracks
            const overfunctioningNote = entry.trackResponses?.overfunctioning?.note || entry.note || '';
            const avoidantNote = entry.trackResponses?.avoidant?.note || '';

            // Build dual-track response display
            let responseHtml = '<div class="history-dual-response">';

            // Overfunctioning status
            responseHtml += '<div class="history-track-status">';
            responseHtml += '<span class="track-label">↓ Overfunctioning:</span> ';
            if (overfunctioningResponse === null) {
                responseHtml += '<span class="no-checkin">Not checked in</span>';
            } else if (overfunctioningResponse) {
                responseHtml += '<span class="yes">✓ Stepped back</span>';
            } else {
                responseHtml += '<span class="no">✗ Did not step back</span>';
            }
            if (overfunctioningNote) {
                responseHtml += ` <span class="inline-note">"${overfunctioningNote}"</span>`;
            }
            responseHtml += '</div>';

            // Avoidant status
            responseHtml += '<div class="history-track-status">';
            responseHtml += '<span class="track-label">♥ Fearful-Avoidant:</span> ';
            if (avoidantResponse === null) {
                responseHtml += '<span class="no-checkin">Not checked in</span>';
            } else if (avoidantResponse) {
                responseHtml += '<span class="yes">✓ Stayed present</span>';
            } else {
                responseHtml += '<span class="no">✗ Did not stay present</span>';
            }
            if (avoidantNote) {
                responseHtml += ` <span class="inline-note">"${avoidantNote}"</span>`;
            }
            responseHtml += '</div>';

            responseHtml += '</div>';

            return `
                <div class="history-item" data-date="${entry.date}">
                    <div class="history-header">
                        <span class="history-date">${this.formatDisplayDate(entry.date)}</span>
                        ${timeStr ? `<span class="history-time">${timeStr}</span>` : ''}
                    </div>
                    ${responseHtml}
                    ${practices.length > 0 ? `
                        <div class="history-practices">
                            ${practices.map(p => `<span>${p}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        // Add click handlers
        list.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                this.openEditModal(item.dataset.date);
            });
        });
    },

    getPracticeLabel(key) {
        const overfunctioningLabels = {
            monday: 'Pause',
            tuesday: 'Not My Circus',
            wednesday: 'Personal Time',
            thursday: 'Good Enough',
            friday: 'No Auto Yes',
            weekend: 'Rest'
        };
        const avoidantLabels = {
            monday: 'Notice Withdrawal',
            tuesday: 'Stay Longer',
            wednesday: 'Ask Directly',
            thursday: 'Reality Check',
            friday: 'Receive Care',
            weekend: 'Self-Soothe'
        };
        const labels = this.currentTrack === 'avoidant' ? avoidantLabels : overfunctioningLabels;
        return labels[key] || key;
    },

    // Edit modal
    openEditModal(dateStr) {
        this.editingEntryDate = dateStr;
        const entry = this.entries.find(e => e.date === dateStr);
        const track = this.tracks[this.currentTrack];
        const response = this.getTrackResponse(entry, this.currentTrack);
        const trackNote = entry?.trackResponses?.[this.currentTrack]?.note ||
                         (this.currentTrack === 'overfunctioning' ? entry?.note : '') || '';

        document.getElementById('edit-date').textContent = this.formatDisplayDate(dateStr);
        document.getElementById('edit-track-label').textContent = `Editing: ${track.name}`;
        document.getElementById('modal-note').value = trackNote;

        document.getElementById('modal-yes').classList.toggle('selected', response === true);
        document.getElementById('modal-no').classList.toggle('selected', response === false);

        document.getElementById('edit-modal').classList.add('active');
    },

    async saveEditedEntry() {
        const response = document.getElementById('modal-yes').classList.contains('selected') ? true :
            document.getElementById('modal-no').classList.contains('selected') ? false : null;
        const note = document.getElementById('modal-note').value.trim();

        let entry = this.entries.find(e => e.date === this.editingEntryDate);

        if (!entry) {
            entry = {
                date: this.editingEntryDate,
                timestamp: new Date().toISOString(),
                steppedBack: null,
                note: '',
                practices: {},
                trackResponses: {
                    overfunctioning: { response: null, note: '' },
                    avoidant: { response: null, note: '' }
                }
            };
            this.entries.push(entry);
        }

        // Ensure trackResponses exists
        if (!entry.trackResponses) {
            entry.trackResponses = {
                overfunctioning: { response: entry.steppedBack, note: entry.note || '' },
                avoidant: { response: null, note: '' }
            };
        }

        // Update the current track's response
        entry.trackResponses[this.currentTrack] = {
            response: response,
            note: note
        };

        // Keep backward compatibility
        entry.steppedBack = entry.trackResponses.overfunctioning.response;
        entry.note = entry.trackResponses.overfunctioning.note;

        await this.saveData();
        this.closeModal('edit-modal');
        this.showToast('Entry updated');

        // Refresh current view
        const activeView = document.querySelector('.view.active').id.replace('-view', '');
        this.showView(activeView);
    },

    // PIN change
    openPinChangeModal() {
        this.pinChangeStep = 'current';
        this.pinChangeValue = '';
        this.newPinValue = '';
        document.getElementById('pin-modal-message').textContent = 'Enter current PIN';
        this.updatePinDots('#pin-modal .pin-display', 0);
        document.getElementById('pin-modal').classList.add('active');
    },

    async processPinChange() {
        if (this.pinChangeStep === 'current') {
            const storedHash = JSON.parse(localStorage.getItem('stepback_pin_hash'));
            const isValid = await CryptoUtils.verifyPin(this.pinChangeValue, storedHash);

            if (isValid) {
                this.pinChangeStep = 'new';
                this.pinChangeValue = '';
                document.getElementById('pin-modal-message').textContent = 'Enter new PIN';
                this.updatePinDots('#pin-modal .pin-display', 0);
            } else {
                document.getElementById('pin-modal-message').textContent = 'Incorrect PIN. Try again.';
                this.pinChangeValue = '';
                this.updatePinDots('#pin-modal .pin-display', 0);
            }
        } else if (this.pinChangeStep === 'new') {
            this.newPinValue = this.pinChangeValue;
            this.pinChangeStep = 'confirm';
            this.pinChangeValue = '';
            document.getElementById('pin-modal-message').textContent = 'Confirm new PIN';
            this.updatePinDots('#pin-modal .pin-display', 0);
        } else if (this.pinChangeStep === 'confirm') {
            if (this.pinChangeValue === this.newPinValue) {
                // Re-encrypt data with new PIN
                const pinHash = await CryptoUtils.hashPin(this.newPinValue);
                localStorage.setItem('stepback_pin_hash', JSON.stringify(pinHash));
                this.currentPin = this.newPinValue;
                await this.saveData();

                this.closeModal('pin-modal');
                this.showToast('PIN changed successfully');
            } else {
                document.getElementById('pin-modal-message').textContent = 'PINs do not match. Enter new PIN.';
                this.pinChangeStep = 'new';
                this.pinChangeValue = '';
                this.newPinValue = '';
                this.updatePinDots('#pin-modal .pin-display', 0);
            }
        }
    },

    // Export/Import
    async exportJSON() {
        const encrypted = localStorage.getItem('stepback_data');
        if (!encrypted) {
            this.showToast('No data to export');
            return;
        }

        const blob = new Blob([encrypted], { type: 'application/json' });
        this.downloadBlob(blob, `stepback-encrypted-${this.formatDate(new Date())}.json`);
        this.showToast('Encrypted data exported');
    },

    exportCSV() {
        if (this.entries.length === 0) {
            this.showToast('No data to export');
            return;
        }

        const headers = ['Date', 'Stepped Back', 'Note', 'Practices'];
        const rows = this.entries.map(e => {
            const practices = e.practices ? Object.keys(e.practices)
                .filter(k => !k.endsWith('_note') && e.practices[k])
                .map(k => this.getPracticeLabel(k)).join('; ') : '';
            return [
                e.date,
                e.steppedBack === null ? '' : (e.steppedBack ? 'Yes' : 'No'),
                `"${(e.note || '').replace(/"/g, '""')}"`,
                `"${practices}"`
            ].join(',');
        });

        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        this.downloadBlob(blob, `stepback-${this.formatDate(new Date())}.csv`);
        this.showToast('CSV exported');
    },

    async exportBackup() {
        const encrypted = localStorage.getItem('stepback_data');
        const pinHash = localStorage.getItem('stepback_pin_hash');
        const settings = localStorage.getItem('stepback_settings');

        const backup = {
            version: 1,
            data: encrypted,
            pinHash: pinHash,
            settings: settings,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' });
        this.downloadBlob(blob, `stepback-backup-${this.formatDate(new Date())}.json`);
        this.showToast('Backup exported');
    },

    async importBackup(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const backup = JSON.parse(text);

            if (backup.version && backup.data && backup.pinHash) {
                this.showConfirmModal(
                    'Import Backup',
                    'This will replace all current data. Continue?',
                    async () => {
                        localStorage.setItem('stepback_data', backup.data);
                        localStorage.setItem('stepback_pin_hash', backup.pinHash);
                        if (backup.settings) {
                            localStorage.setItem('stepback_settings', backup.settings);
                        }
                        this.showToast('Backup imported. Please unlock with your backup PIN.');
                        location.reload();
                    }
                );
            } else {
                this.showToast('Invalid backup file');
            }
        } catch (err) {
            this.showToast('Failed to read backup file');
        }

        e.target.value = '';
    },

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // Clear data
    confirmClearData() {
        this.showConfirmModal(
            'Clear All Data',
            'This will permanently delete all your data. This cannot be undone.',
            async () => {
                localStorage.removeItem('stepback_data');
                localStorage.removeItem('stepback_pin_hash');
                localStorage.removeItem('stepback_settings');
                this.showToast('All data cleared');
                location.reload();
            }
        );
    },

    // Modals
    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    },

    showConfirmModal(title, message, onConfirm) {
        document.getElementById('confirm-title').textContent = title;
        document.getElementById('confirm-message').textContent = message;
        document.getElementById('confirm-ok').onclick = () => {
            this.closeModal('confirm-modal');
            onConfirm();
        };
        document.getElementById('confirm-modal').classList.add('active');
    },

    // Toast notification
    showToast(message) {
        let toast = document.querySelector('.toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('visible');
        setTimeout(() => toast.classList.remove('visible'), 2500);
    },

    // Service Worker (required for PWA install, but no caching)
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.register('sw.js');
            } catch (error) {
                console.log('ServiceWorker registration failed:', error);
            }
        }
    },

    // Force refresh the app to get latest version
    async refreshApp() {
        this.showToast('Refreshing app...');

        try {
            // Unregister all service workers
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const registration of registrations) {
                    await registration.unregister();
                }
            }

            // Clear all caches
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                for (const name of cacheNames) {
                    await caches.delete(name);
                }
            }

            // Hard reload the page (bypass cache)
            window.location.reload(true);
        } catch (error) {
            console.log('Refresh error:', error);
            // Fall back to regular reload
            window.location.reload(true);
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());
