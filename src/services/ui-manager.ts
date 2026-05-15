const OVERLAY_ID = 'leetcode-hinter-root';
const DRAWER_WIDTH = '440px';
const HANDLE_WIDTH = '40px';

export const UIManager = {
  injectOverlay() {
    if (document.getElementById(OVERLAY_ID)) return;

    const container = document.createElement('div');
    container.id = OVERLAY_ID;
    
    Object.assign(container.style, {
      position: 'fixed',
      top: '0',
      right: '0',
      height: '100vh',
      width: '0px',
      zIndex: '2147483647',
      transition: 'width 0.4s cubic-bezier(0.19, 1, 0.22, 1), box-shadow 0.4s ease',
      backgroundColor: 'white',
      display: 'flex',
      flexDirection: 'row-reverse',
      boxShadow: 'none'
    });

    const iframe = document.createElement('iframe');
    iframe.src = chrome.runtime.getURL('overlay.html');
    Object.assign(iframe.style, {
      height: '100%',
      width: DRAWER_WIDTH,
      border: 'none',
      opacity: '0',
      transition: 'opacity 0.3s ease',
      flexShrink: '0'
    });

    const handle = this.createHandle();
    container.appendChild(handle);
    container.appendChild(iframe);
    document.body.appendChild(container);

    this.setupListeners(container, iframe, handle);
  },

  createHandle(): HTMLDivElement {
    const handle = document.createElement('div');
    handle.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </div>
    `;
    Object.assign(handle.style, {
      position: 'absolute',
      left: `-${HANDLE_WIDTH}`,
      top: '50%',
      transform: 'translateY(-50%)',
      width: HANDLE_WIDTH,
      height: '80px',
      backgroundColor: '#ffa116',
      borderTopLeftRadius: '16px',
      borderBottomLeftRadius: '16px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '-4px 0 15px rgba(0,0,0,0.15)',
      transition: 'all 0.3s ease',
      zIndex: '2147483647',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRight: 'none'
    });
    return handle;
  },

  setupListeners(container: HTMLDivElement, iframe: HTMLIFrameElement, handle: HTMLDivElement) {
    let isOpen = false;
    let isLocked = false;

    const open = () => {
      isOpen = true;
      container.style.width = DRAWER_WIDTH;
      container.style.boxShadow = '-10px 0 50px rgba(0,0,0,0.2)';
      iframe.style.opacity = '1';
      handle.style.opacity = '0';
      handle.style.pointerEvents = 'none';
    };

    const close = () => {
      if (!isLocked) {
        isOpen = false;
        container.style.width = '0px';
        container.style.boxShadow = 'none';
        iframe.style.opacity = '0';
        handle.style.opacity = '1';
        handle.style.pointerEvents = 'auto';
      }
    };

    handle.addEventListener('mouseenter', open);
    container.addEventListener('mouseleave', close);

    chrome.runtime.onMessage.addListener((request) => {
      if (request.action === "TOGGLE_OVERLAY") {
        if (isOpen) {
          isLocked = false;
          close();
        } else {
          isLocked = true;
          open();
        }
      }
    });

    window.addEventListener('message', (event) => {
      if (event.data.type === 'LEETCODE_HINTER_LOCK') {
        isLocked = event.data.locked;
        if (!isLocked) close();
      }
    });
  }
};
