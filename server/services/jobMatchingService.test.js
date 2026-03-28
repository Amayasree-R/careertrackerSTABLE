import { extractSkills, getMatchLabel } from './jobMatchingService.js';

describe('Job Match Scoring Logic', () => {
  describe('Skill Extraction', () => {
    test('should extract technical skills from job description text', () => {
      const text = 'Wanted: a developer with React, Node.js, and Docker experience.';
      const extracted = extractSkills(text);
      expect(extracted).toContain('react');
      expect(extracted).toContain('node.js');
      expect(extracted).toContain('docker');
    });

    test('should handle case insensitivity', () => {
      const text = 'Proficient in JAVASCRIPT and PYTHON.';
      const extracted = extractSkills(text);
      expect(extracted).toContain('javascript');
      expect(extracted).toContain('python');
    });

    test('should respect word boundaries (no false positives for "r")', () => {
      const text = 'Looking for a regular worker.';
      const extracted = extractSkills(text);
      // 'r' is in TECH_SKILLS, but 'regular' shouldn't trigger it
      expect(extracted).not.toContain('r');
    });
  });

  describe('Label Assignment', () => {
    test('should return "Strong Match" for scores >= 75', () => {
      expect(getMatchLabel(90)).toBe('Strong Match');
      expect(getMatchLabel(75)).toBe('Strong Match');
    });

    test('should return "Good Match" for scores >= 50 and < 75', () => {
      expect(getMatchLabel(60)).toBe('Good Match');
      expect(getMatchLabel(50)).toBe('Good Match');
    });

    test('should return "Partial Match" for scores >= 25 and < 50', () => {
      expect(getMatchLabel(30)).toBe('Partial Match');
      expect(getMatchLabel(25)).toBe('Partial Match');
    });

    test('should return "Low Match" for scores < 25', () => {
      expect(getMatchLabel(10)).toBe('Low Match');
      expect(getMatchLabel(0)).toBe('Low Match');
    });
  });

  describe('Intersection Logic (Simulated)', () => {
    test('should calculate correct percentage of skills matched', () => {
      const requiredSkills = ['react', 'node.js', 'mongodb', 'docker'];
      const userSkills = ['react', 'node.js'];
      
      const matchedCount = requiredSkills.filter(s => userSkills.includes(s)).length;
      const score = Math.round((matchedCount / requiredSkills.length) * 100);
      
      expect(score).toBe(50);
      expect(getMatchLabel(score)).toBe('Good Match');
    });
  });
});
