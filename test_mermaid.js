import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

// We can't easily import mermaid in a pure Node.js env without a DOM.
// mermaid.js requires window/document to parse diagrams.
// However, there's @mermaid-js/mermaid-cli or we can just use regex.
