// Step Back - Main Application

const App = {
    currentPin: null,
    entries: [],
    settings: {},
    currentMonthOffset: 0,
    editingEntryDate: null,

    // Daily practices data
    practices: {
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

    // Initialize the app
    async init() {
        this.bindEvents();
        await this.checkSetup();
        this.registerServiceWorker();
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
                whySection.classList.toggle('visible');
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
            }
        }
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
        return date.toISOString().split('T')[0];
    },

    formatDisplayDate(dateStr) {
        const date = new Date(dateStr + 'T12:00:00');
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric'
        });
    },

    getTodayEntry() {
        const today = this.formatDate(new Date());
        return this.entries.find(e => e.date === today);
    },

    renderCheckin() {
        const today = new Date();
        document.getElementById('today-date').textContent = this.formatDisplayDate(this.formatDate(today));

        const todayEntry = this.getTodayEntry();

        if (todayEntry) {
            document.getElementById('quick-checkin').style.display = 'none';
            document.getElementById('checkin-done').style.display = 'block';
            document.getElementById('done-response').textContent =
                todayEntry.steppedBack ? 'You stepped back today' : 'You did not step back today';
            document.getElementById('done-note').textContent = todayEntry.note || '';

            // Load practices
            this.loadPracticesForToday(todayEntry);
        } else {
            document.getElementById('quick-checkin').style.display = 'block';
            document.getElementById('checkin-done').style.display = 'none';
            document.getElementById('quick-note').value = '';
            document.getElementById('char-count').textContent = '0';

            // Reset practices
            this.resetPractices();
        }

        // Show today's practice
        this.renderTodaysPractice(today.getDay());
    },

    renderTodaysPractice(dayOfWeek) {
        const practice = this.practices[dayOfWeek];
        document.getElementById('todays-practice-title').textContent = practice.title;
        document.getElementById('todays-practice-desc').textContent = practice.desc;

        const examplesList = document.getElementById('todays-examples-list');
        examplesList.innerHTML = practice.examples.map(ex => `<li>${ex}</li>`).join('');
    },

    async doCheckin(steppedBack) {
        const today = this.formatDate(new Date());
        const note = document.getElementById('quick-note').value.trim();

        const entry = {
            date: today,
            timestamp: new Date().toISOString(),
            steppedBack: steppedBack,
            note: note,
            practices: {}
        };

        // Remove existing entry for today if any
        this.entries = this.entries.filter(e => e.date !== today);
        this.entries.push(entry);

        await this.saveData();
        this.showToast('Check-in saved');
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

        // Days of the month
        let checkinCount = 0;
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

            if (entry && entry.steppedBack !== null) {
                dayEl.classList.add(entry.steppedBack ? 'yes' : 'no');
                if (!isFuture) checkinCount++;
            }

            dayEl.innerHTML = `
                <span class="day-num">${day}</span>
                <span class="day-status">${entry && entry.steppedBack !== null ? (entry.steppedBack ? '&#10003;' : '&#8212;') : ''}</span>
            `;

            if (!isFuture) {
                dayEl.addEventListener('click', () => this.openEditModal(dateStr));
            }

            grid.appendChild(dayEl);
        }

        // Summary
        const summaryText = this.currentMonthOffset === 0
            ? `You checked in ${checkinCount} out of ${totalDaysUpToToday} days this month`
            : `You checked in ${checkinCount} out of ${daysInMonth} days`;

        document.getElementById('month-summary').innerHTML = `<p>${summaryText}</p>`;
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

            return `
                <div class="history-item" data-date="${entry.date}">
                    <div class="history-date">${this.formatDisplayDate(entry.date)}</div>
                    <div class="history-response ${entry.steppedBack ? 'yes' : 'no'}">
                        ${entry.steppedBack === null ? 'No check-in' : (entry.steppedBack ? '&#10003; Stepped back' : '&#8212; Did not step back')}
                    </div>
                    ${entry.note ? `<div class="history-note">"${entry.note}"</div>` : ''}
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
        const labels = {
            monday: 'Pause',
            tuesday: 'Not My Circus',
            wednesday: 'Personal Time',
            thursday: 'Good Enough',
            friday: 'No Auto Yes',
            weekend: 'Rest'
        };
        return labels[key] || key;
    },

    // Edit modal
    openEditModal(dateStr) {
        this.editingEntryDate = dateStr;
        const entry = this.entries.find(e => e.date === dateStr);

        document.getElementById('edit-date').textContent = this.formatDisplayDate(dateStr);
        document.getElementById('modal-note').value = entry ? entry.note || '' : '';

        document.getElementById('modal-yes').classList.toggle('selected', entry && entry.steppedBack === true);
        document.getElementById('modal-no').classList.toggle('selected', entry && entry.steppedBack === false);

        document.getElementById('edit-modal').classList.add('active');
    },

    async saveEditedEntry() {
        const steppedBack = document.getElementById('modal-yes').classList.contains('selected') ? true :
            document.getElementById('modal-no').classList.contains('selected') ? false : null;
        const note = document.getElementById('modal-note').value.trim();

        let entry = this.entries.find(e => e.date === this.editingEntryDate);

        if (entry) {
            entry.steppedBack = steppedBack;
            entry.note = note;
        } else {
            entry = {
                date: this.editingEntryDate,
                timestamp: new Date().toISOString(),
                steppedBack: steppedBack,
                note: note,
                practices: {}
            };
            this.entries.push(entry);
        }

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
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());
