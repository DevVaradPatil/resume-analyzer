'use client';

import { useEffect, useRef } from 'react';

/**
 * The last interactive element the user engaged with.
 *
 * `document.activeElement` at open time is not reliable: the buttons that open
 * these modals disable themselves while the request is in flight, and
 * disabling a focused element moves focus to <body>. By the time the modal
 * mounts there is nothing useful left to remember, so focus would land on
 * <body> at close and keyboard users would lose their place in the page.
 *
 * Both signals are tracked because neither alone is sufficient: `focusin`
 * covers keyboard navigation, and `pointerdown` covers mouse and touch (where
 * the element may never receive focus at all, and where `focusin` does not
 * fire if the document itself lacks OS focus).
 */
let lastInteractedElement = null;
let interactionTrackerAttached = false;

function attachInteractionTracker() {
  if (interactionTrackerAttached || typeof document === 'undefined') return;
  interactionTrackerAttached = true;

  const remember = (event) => {
    // Only remember something focus can actually be returned to.
    const target = event.target?.closest?.(FOCUSABLE);
    if (target && target !== document.body) {
      lastInteractedElement = target;
    }
  };

  document.addEventListener('focusin', remember, true);
  document.addEventListener('pointerdown', remember, true);
  // Covers programmatic and keyboard-activated clicks, which do not always
  // produce a pointerdown.
  document.addEventListener('click', remember, true);
}

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Gives a modal the keyboard and screen-reader behaviour users expect:
 *
 *  - Escape closes it.
 *  - Focus moves into the dialog on open and returns to whatever was focused
 *    before, on close.
 *  - Tab and Shift+Tab cycle within the dialog instead of escaping into the
 *    page behind it.
 *  - The page behind cannot scroll while the dialog is open.
 *
 * Returns a ref to attach to the dialog container.
 *
 * @param {boolean} isOpen - Whether the modal is currently rendered
 * @param {Function} onClose - Called when the user presses Escape
 * @returns {Object} ref to place on the dialog element
 */
export function useModalA11y(isOpen, onClose) {
  const containerRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  // Callers pass an inline arrow for onClose, so its identity changes on every
  // parent render. Holding it in a ref keeps the effect below keyed solely on
  // `isOpen`. Without this the effect tore down and re-ran on each render,
  // re-capturing "previously focused" as whatever was focused *inside* the
  // dialog -- so on close there was nothing valid left to restore focus to.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    attachInteractionTracker();
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    // Remember where focus came from so it can be restored on close.
    const active = typeof document !== 'undefined' ? document.activeElement : null;
    const meaningfulActive = active && active !== document.body ? active : null;

    // Fall back to the last tracked element when focus has already been lost
    // to <body> -- see the note on lastInteractedElement above.
    previouslyFocusedRef.current = meaningfulActive || lastInteractedElement;

    const container = containerRef.current;

    // Move focus into the dialog. Prefer the first focusable control; fall back
    // to the container itself (which carries tabIndex={-1}).
    if (container) {
      const first = container.querySelector(FOCUSABLE);
      (first || container).focus?.({ preventScroll: true });
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current?.();
        return;
      }

      if (event.key !== 'Tab' || !containerRef.current) return;

      const focusable = Array.from(
        containerRef.current.querySelectorAll(FOCUSABLE)
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);

      if (focusable.length === 0) {
        // Nothing to cycle through; keep focus on the dialog itself.
        event.preventDefault();
        containerRef.current.focus?.({ preventScroll: true });
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      // Wrap around at both ends so Tab never leaves the dialog.
      if (event.shiftKey && (active === first || !containerRef.current.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);

    // Lock background scroll, preserving whatever the page already had.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.body.style.overflow = previousOverflow;

      // Restore focus, but only to an element that is still in the document
      // and still able to take focus (the trigger may have been disabled).
      const previous = previouslyFocusedRef.current;
      if (previous && document.contains(previous) && !previous.disabled) {
        previous.focus?.({ preventScroll: true });
      }
    };
  }, [isOpen]);

  return containerRef;
}

export default useModalA11y;
