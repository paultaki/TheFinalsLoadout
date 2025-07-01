import '@testing-library/jest-dom';

// Make Jest globals available in ES modules
import { jest } from '@jest/globals';

// Expose Jest globals to window for tests
(globalThis as any).jest = jest;

// localStorage is already provided by jest-environment-jsdom
// No need to mock it

// Mock HTMLMediaElement for audio tests
window.HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve());
window.HTMLMediaElement.prototype.pause = jest.fn();
window.HTMLMediaElement.prototype.load = jest.fn();