/**
 * Master Student Roster & Validation Utilities
 * 
 * Rules:
 * - 23BQ1A0501 to 23BQ1A0563 excluding 23BQ1A0526, 23BQ1A0529, 23BQ1A0554
 * - 24BQ5A0501 to 24BQ5A0508
 */

const EXCLUDED_ROLLS_23 = ['23BQ1A0526', '23BQ1A0529', '23BQ1A0554'];

function generateMasterRoster() {
  const roster = [];
  
  // 23BQ1A0501 - 23BQ1A0563 (excluding 526, 529, 554)
  for (let i = 1; i <= 63; i++) {
    const pad = i < 10 ? '0' + i : '' + i;
    const roll = `23BQ1A05${pad}`;
    if (!EXCLUDED_ROLLS_23.includes(roll)) {
      roster.push(roll);
    }
  }

  // 24BQ5A0501 - 24BQ5A0508
  for (let i = 1; i <= 8; i++) {
    const pad = i < 10 ? '0' + i : '' + i;
    const roll = `24BQ5A05${pad}`;
    roster.push(roll);
  }

  return roster;
}

const MASTER_ROSTER = generateMasterRoster();

/**
 * Validates format and presence in roster
 */
function isValidRollNumber(rollNo) {
  if (!rollNo) return { valid: false, message: "Roll number is required" };
  const cleaned = rollNo.trim().toUpperCase();
  
  // Check regex format 23BQ1A05XX or 24BQ5A05XX
  const formatRegex = /^(23BQ1A05[0-9]{2}|24BQ5A05[0-9]{2})$/;
  if (!formatRegex.test(cleaned)) {
    return {
      valid: false,
      message: "Roll number must follow format 23BQ1A05XX (01-63) or 24BQ5A05XX (01-08)."
    };
  }

  if (EXCLUDED_ROLLS_23.includes(cleaned)) {
    return {
      valid: false,
      message: `Roll number ${cleaned} is excluded from this drive.`
    };
  }

  if (!MASTER_ROSTER.includes(cleaned)) {
    return {
      valid: false,
      message: `Roll number ${cleaned} is outside the designated student list.`
    };
  }

  return { valid: true, rollNo: cleaned };
}

module.exports = {
  MASTER_ROSTER,
  EXCLUDED_ROLLS_23,
  generateMasterRoster,
  isValidRollNumber
};
