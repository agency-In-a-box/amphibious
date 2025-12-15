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