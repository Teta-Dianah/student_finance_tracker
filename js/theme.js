
// This script runs immediately in the head to prevent theme flickering.
(function () {
    const SETTINGS_KEY = 'student_finance_settings';
    const data = localStorage.getItem(SETTINGS_KEY);
    const settings = data ? JSON.parse(data) : { darkMode: false };

    if (settings.darkMode) {
        document.documentElement.classList.add('dark-mode');
    } else {
        document.documentElement.classList.remove('dark-mode');
    }
    document.addEventListener('DOMContentLoaded', () => {
        const userName = settings.userName || 'Student';
        const firstInitial = userName.charAt(0).toUpperCase();

        const nameElements = document.querySelectorAll('.user-name');
        const avatarElements = document.querySelectorAll('.avatar');

        nameElements.forEach(el => el.textContent = userName);
        avatarElements.forEach(el => el.textContent = firstInitial);
    });
})();
