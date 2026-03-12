/**
 * A4 page-packing utilities for resume pagination.
 * At screen resolution (96 DPI): 1 mm = 96 / 25.4 px ≈ 3.7795 px
 *
 * Item-level pagination:
 *   Each section is broken into individual items (rows/bullets/cards).
 *   Items from the same section can be split across pages instead of
 *   bumping an entire section to the next page, eliminating blank space.
 */

export const MM_TO_PX = 96 / 25.4

/** Usable page height in px: 297mm − 2×15mm padding = 267mm ≈ 1009 px */
export const PAGE_USABLE_HEIGHT_PX = (297 - 15 * 2) * MM_TO_PX

/**
 * An "item slot" represents one renderable line within a page.
 * @typedef {{ sectionKey: string, itemIndex: number|null, isHeading: boolean, height: number }} ItemSlot
 */

/**
 * Packs individual section items into A4 pages.
 *
 * Input `sections` is an ordered array of:
 *   {
 *     key: string,
 *     headingHeight: number,   // height of section heading block
 *     items: Array<{ height: number }>   // individual item heights
 *   }
 *
 * A "section" with no repeating items (summary, skills, interests, languages)
 * should be passed as a single item with the full content height and headingHeight = 0.
 *
 * @param {Array<{key:string, headingHeight:number, items:Array<{height:number}>}>} sections
 * @param {number} [pageHeightPx]
 * @param {number} [firstPageHeightPx]  – usable height on page 1 (after a fixed header)
 * @returns {Array<Array<ItemSlot>>}   – pages[i] = ordered array of ItemSlot for that page
 */
export function packSectionsInPages(sections, pageHeightPx, firstPageHeightPx) {
  if (!sections || sections.length === 0) return [[]]

  const maxH = pageHeightPx ?? PAGE_USABLE_HEIGHT_PX
  let remaining = firstPageHeightPx !== undefined ? firstPageHeightPx : maxH

  const pages = []
  let current = []

  const newPage = () => {
    if (current.length > 0) pages.push(current)
    current = []
    remaining = maxH
  }

  // Minimum height we reserve after placing a heading so the first item fits.
  // If we can't fit heading + first item, move heading to next page.
  const MIN_AFTER_HEADING = 32

  for (const section of sections) {
    const { key, headingHeight, items } = section

    if (!items || items.length === 0) continue

    // Treat atomically (summary, skills, interests, languages):
    // headingHeight === 0 means the whole section is a single blob.
    if (headingHeight === 0) {
      const blobH = items[0].height
      if (blobH > remaining && current.length > 0) newPage()
      current.push({ sectionKey: key, itemIndex: 0, isHeading: false, height: blobH })
      remaining -= blobH
      continue
    }

    // Multi-item section – may split across pages.
    let needsHeading = true

    for (let i = 0; i < items.length; i++) {
      const itemH = items[i].height
      const isFirst = i === 0

      if (needsHeading) {
        // Decide whether heading fits alongside at least MIN_AFTER_HEADING more
        const headingNeeds = headingHeight + Math.min(itemH, MIN_AFTER_HEADING)
        if (headingNeeds > remaining && current.length > 0) {
          newPage()
        }
        current.push({ sectionKey: key, itemIndex: null, isHeading: true, height: headingHeight })
        remaining -= headingHeight
        needsHeading = false
      }

      // Place the item – if it doesn't fit, start a new page and re-emit heading (continued)
      if (itemH > remaining && current.length > 0) {
        newPage()
        // Re-emit heading as "continued" on new page
        current.push({ sectionKey: key, itemIndex: null, isHeading: true, isContinued: true, height: headingHeight })
        remaining -= headingHeight
      }

      current.push({ sectionKey: key, itemIndex: i, isHeading: false, height: itemH })
      remaining -= itemH
    }
  }

  if (current.length > 0) pages.push(current)
  return pages.length > 0 ? pages : [[]]
}

// ─── Legacy section-level packer (used by Sidebar/TwoColumn templates) ───────

/**
 * Packs sections (atomic) into A4 pages.
 * @param {Array<{key: string, height: number}>} sections
 * @param {number} [pageHeightPx]
 * @param {number} [firstPageHeightPx]
 * @returns {string[][]}
 */
export function packSectionsIntoPages(sections, pageHeightPx, firstPageHeightPx) {
  if (!sections || sections.length === 0) return [[]]

  const maxH = pageHeightPx ?? PAGE_USABLE_HEIGHT_PX
  let remaining = firstPageHeightPx !== undefined ? firstPageHeightPx : maxH

  const pages = []
  let current = []

  for (const { key, height } of sections) {
    if (current.length > 0 && height > remaining) {
      pages.push(current)
      current = [key]
      remaining = maxH - height
    } else {
      current.push(key)
      remaining -= height
    }
  }

  if (current.length > 0) pages.push(current)
  return pages.length > 0 ? pages : [sections.map(s => s.key)]
}
