import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "index.html").read_text(encoding="utf-8")
CSS = (ROOT / "styles.css").read_text(encoding="utf-8")
SCRIPT = (ROOT / "script.js").read_text(encoding="utf-8")


def section_markup(section_id):
    match = re.search(
        rf'<section\b(?=[^>]*\bid=["\']{re.escape(section_id)}["\'])[^>]*>(.*?)</section>',
        HTML,
        re.IGNORECASE | re.DOTALL,
    )
    if not match:
        raise AssertionError(f"Missing section #{section_id}")
    return match.group(0)


class PortfolioContentTests(unittest.TestCase):
    def test_approach_section_follows_about_and_precedes_projects(self):
        about = HTML.index('id="about"')
        approach = HTML.index('id="approach"')
        projects = HTML.index('id="projects"')
        self.assertLess(about, approach)
        self.assertLess(approach, projects)
        approach_markup = section_markup("approach")
        for stage in ("Discover", "Define", "Design", "Animate", "Refine"):
            self.assertIn(stage, approach_markup)

    def test_3d_motion_showcase_follows_approach_and_precedes_projects(self):
        approach = HTML.index('id="approach"')
        motion = HTML.index('id="motion"')
        projects = HTML.index('id="projects"')
        self.assertLess(approach, motion)
        self.assertLess(motion, projects)
        motion_markup = section_markup("motion")
        for phrase in ("3D &amp; Motion", "Blender", "3D MOTION STUDY", "Form in motion.", "FORM", "LIGHT", "MOVEMENT"):
            self.assertIn(phrase, motion_markup)
        self.assertIn('href="#motion"', HTML)
        self.assertIn(".motion-orbit", CSS)
        self.assertIn(".motion-orbit", CSS[CSS.index("@media (prefers-reduced-motion: reduce)"):])

    def test_design_tools_are_grouped_under_graphic_design(self):
        design_panel = section_markup("skills").split('data-skill-panel="design"', 1)[1]
        tools_panel = section_markup("skills").split('data-skill-panel="tools"', 1)[1]
        for tool in ("Figma", "Canva", "GIMP", "Adobe Creative Cloud", "CapCut", "Blender"):
            self.assertIn(tool, design_panel, f"{tool} should be listed in Graphic Design")
            self.assertNotIn(tool, tools_panel, f"{tool} should not be listed in Tools")
        for tool in ("Git", "Docker", "AWS"):
            self.assertIn(tool, tools_panel)

    def test_design_promo_and_inquiry_form_are_removed_but_gallery_and_contact_remain(self):
        self.assertNotIn("Featured Design Work", HTML)
        self.assertNotIn("Explore the graphic design gallery", HTML)
        self.assertNotIn('id="clientInquiryForm"', HTML)
        self.assertIn('data-project-category="design"', HTML)
        contact = section_markup("contact")
        self.assertIn('href="mailto:jane@miraditechtribe.com"', contact)

    def test_approach_motion_respects_reduced_motion_preference(self):
        self.assertIn(".approach", CSS)
        self.assertRegex(CSS, r"@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.approach")

    def test_existing_navigation_and_project_filter_initializers_remain_enabled(self):
        initializer = SCRIPT.split("function initializeApp() {", 1)[1].split("\n  }", 1)[0]
        self.assertIn("initSmoothScrolling();", initializer)
        self.assertEqual(initializer.count("initProjectFilters();"), 1)
        self.assertNotIn("initContactLinks();", initializer)


if __name__ == "__main__":
    unittest.main()
