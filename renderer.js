window.addEventListener('DOMContentLoaded', async () => {
    const deListContainer = document.getElementById('de-list-container');
    const loadingMessage = document.getElementById('loading-message');
    const refreshButton = document.getElementById('refresh-de');

    const loadDesktopEnvironmentsStatus = async () => {
        loadingMessage.style.display = 'block';
        deListContainer.innerHTML = ''; // Clear previous list
        try {
            const deStatuses = await window.deAPI.getDesktopEnvironmentsStatus();
            loadingMessage.style.display = 'none';

            if (deStatuses.length === 0) {
                deListContainer.innerHTML = '<p>No common Desktop Environments found to check.</p>';
                return;
            }

            deStatuses.forEach(de => {
                const card = document.createElement('div');
                card.classList.add('de-card');

                const statusClass = de.installed ? 'installed' : 'not-installed';
                const statusText = de.installed ? 'Installed' : 'Not Installed';

                card.innerHTML = `
                    <h2>${de.displayName}</h2>
                    <p class="installed-status">Status: <span class="${statusClass}">${statusText}</span></p>
                `;

                if (!de.installed) {
                    const commandContainer = document.createElement('div');
                    commandContainer.classList.add('install-command-container');

                    const commandSpan = document.createElement('span');
                    commandSpan.classList.add('install-command');
                    commandSpan.textContent = de.installCommand;

                    const copyButton = document.createElement('button');
                    copyButton.classList.add('copy-btn');
                    copyButton.textContent = 'Copy Command';
                    copyButton.onclick = () => {
                        navigator.clipboard.writeText(de.installCommand).then(() => {
                            copyButton.textContent = 'Copied!';
                            setTimeout(() => { copyButton.textContent = 'Copy Command'; }, 2000);
                        }).catch(err => {
                            console.error('Failed to copy text: ', err);
                            alert('Failed to copy command.');
                        });
                    };

                    commandContainer.appendChild(commandSpan);
                    commandContainer.appendChild(copyButton);
                    card.appendChild(commandContainer);
                }

                deListContainer.appendChild(card);
            });

        } catch (error) {
            console.error('Failed to load DE statuses:', error);
            loadingMessage.style.display = 'none';
            deListContainer.innerHTML = `<p style="color: red;">Error: ${error.message || 'Could not load DE statuses.'}</p>`;
        }
    };

    refreshButton.addEventListener('click', loadDesktopEnvironmentsStatus);
    loadDesktopEnvironmentsStatus(); // Initial load
});