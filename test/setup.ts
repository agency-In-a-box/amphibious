/**
 * Test Environment Setup
 * Configures happy-dom for all tests
 */

import { Window } from 'happy-dom';

// Create window and document globals
const window = new Window();
const document = window.document;

// Set up globals
global.window = window as any;
global.document = document;
global.navigator = window.navigator;
global.HTMLElement = window.HTMLElement;
global.Element = window.Element;
global.CustomEvent = window.CustomEvent;
global.MouseEvent = window.MouseEvent;
global.KeyboardEvent = window.KeyboardEvent;
global.Event = window.Event;
global.Node = window.Node;
global.NodeList = window.NodeList;
global.HTMLCollection = window.HTMLCollection;

// Add common browser APIs
global.requestAnimationFrame = (callback: FrameRequestCallback) => {
  return setTimeout(callback, 0) as any;
};

global.cancelAnimationFrame = (id: number) => {
  clearTimeout(id);
};

// Storage APIs
global.localStorage = window.localStorage;
global.sessionStorage = window.sessionStorage;

// DOM parsing
global.DOMParser = window.DOMParser;

// Location
global.location = window.location;

// Mock scrolling behavior for tests
let mockScrollY = 0;
let mockScrollX = 0;

Object.defineProperty(global.window, 'scrollY', {
  get: () => mockScrollY,
  configurable: true
});

Object.defineProperty(global.window, 'pageYOffset', {
  get: () => mockScrollY,
  configurable: true
});

Object.defineProperty(global.window, 'scrollX', {
  get: () => mockScrollX,
  configurable: true
});

Object.defineProperty(global.window, 'pageXOffset', {
  get: () => mockScrollX,
  configurable: true
});

// Mock scrollTo
global.window.scrollTo = (x: number | ScrollToOptions, y?: number) => {
  if (typeof x === 'object') {
    mockScrollX = x.left || 0;
    mockScrollY = x.top || 0;
  } else {
    mockScrollX = x;
    mockScrollY = y || 0;
  }
};

// Mock scrollBy
global.window.scrollBy = (x: number | ScrollToOptions, y?: number) => {
  if (typeof x === 'object') {
    mockScrollX += x.left || 0;
    mockScrollY += x.top || 0;
  } else {
    mockScrollX += x;
    mockScrollY += y || 0;
  }
};

// Mock getBoundingClientRect for elements
const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
Element.prototype.getBoundingClientRect = function() {
  const rect = originalGetBoundingClientRect.call(this);
  // Return a mock rect with proper values
  return {
    top: rect.top || 0,
    left: rect.left || 0,
    bottom: rect.bottom || 100,
    right: rect.right || 100,
    width: rect.width || 100,
    height: rect.height || 100,
    x: rect.x || 0,
    y: rect.y || 0,
    toJSON: () => ({})
  };
};