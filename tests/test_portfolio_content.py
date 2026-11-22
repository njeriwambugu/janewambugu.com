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


def skill_panel_markup(panel_id, following_panel_id):
    skills = section_markup("skills")
    start = skills.index(f'data-skill-panel="{panel_id}"')
    end = skills.index(f'data-skill-panel="{following_panel_id}"', start)
    return skills[start:end]


class PortfolioContentTests(unittest.TestCase):
    def test_skill_tab_order_matches_panel_order(self):
        skills = section_markup("skills")
        tab_targets = re.findall(r'data-skill-target="([^"]+)"', skills)
        panel_targets = re.findall(r'data-skill-panel="([^"]+)"', skills)
        self.assertEqual(tab_targets, panel_targets)

    def test_approach_section_follows_about_and_precedes_projects(self):
        about = HTML.index('id="about"')
        approach = HTML.index('id="approach"')
        projects = HTML.index('id="projects"')
        self.assertLess(about, approach)
        self.assertLess(approach, projects)
        approach_markup = section_markup("approach")
        for stage in ("Discover", "Define", "Design", "Animate", "Refine"):
            self.assertIn(stage, approach_markup)

    def test_animation_category_sits_by_graphic_design_and_contains_the_motion_study(self):
        skills = section_markup("skills")
        tab_targets = re.findall(r'data-skill-target="([^"]+)"', skills)
        design_index = tab_targets.index("design")
        self.assertEqual(tab_targets[design_index + 1], "animation")
        self.assertIn('data-skill-panel="animation"', skills)
        animation_panel = skill_panel_markup("animation", "tools")
        self.assertIn('id="motion"', animation_panel)
        self.assertIn("3D &amp; Motion", animation_panel)
        self.assertIn("Blender", animation_panel)
        self.assertNotIn("motion-visual", animation_panel)
        self.assertNotIn("motion-sphere", animation_panel)
        self.assertNotIn("motion-orbit", animation_panel)
        self.assertIn("images/logos/Blender.png", animation_panel)
        self.assertNotRegex(HTML, r'<section\b[^>]*\bid=["\']motion["\']')
        self.assertNotIn('href="#motion"', HTML)

    def test_approach_and_motion_copy_avoids_template_labels_and_unneeded_decoration(self):
        self.assertIn("I start by understanding the goal and who it’s for.", section_markup("approach"))
        for unwanted in (
            "THOUGHTFUL BY DESIGN",
            "DIMENSION, LIGHT &amp; MOVEMENT",
            "BLENDER · 3D STUDIES",
            "3D MOTION STUDY",
            "01 / FORM",
            "X&nbsp; / &nbsp;Y",
            "A considered idea. A clear visual system. Motion with meaning.",
        ):
            self.assertNotIn(unwanted, HTML)
        self.assertIn("form, light, materials and movement", skill_panel_markup("animation", "tools"))

    def test_design_and_animation_tools_are_grouped_under_their_skill_categories(self):
        design_panel = skill_panel_markup("design", "animation")
        animation_panel = skill_panel_markup("animation", "tools")
        tools_panel = section_markup("skills").split('data-skill-panel="tools"', 1)[1]
        for tool in ("Figma", "Canva", "GIMP", "Adobe Creative Cloud"):
            self.assertIn(tool, design_panel, f"{tool} should be listed in Graphic Design")
            self.assertNotIn(tool, tools_panel, f"{tool} should not be listed in Tools")
        for tool in ("Blender", "CapCut"):
            self.assertIn(tool, animation_panel, f"{tool} should be listed in Animation")
            self.assertNotIn(tool, design_panel, f"{tool} should not be listed in Graphic Design")
        for tool in ("Git", "Docker", "AWS"):
            self.assertIn(tool, tools_panel)

    def test_ai_category_lists_all_available_ai_logos(self):
        skills = section_markup("skills")
        targets = re.findall(r'data-skill-target="([^"]+)"', skills)
        self.assertIn("ai", targets)
        ai_panel = skill_panel_markup("ai", "design")
        for label, logo_path in (
            ("ChatGPT", "images/chatgpt-com-logo.png"),
            ("PyTorch", "images/logos/PyTorch.svg"),
            ("TensorFlow", "images/logos/TensorFlow.svg"),
            ("scikit-learn", "images/logos/scikit-learn.svg"),
            ("NumPy", "images/logos/NumPy.svg"),
            ("Higgsfield", "images/logos/Higgsfield.png"),
        ):
            self.assertIn(label, ai_panel)
            self.assertIn(f'src="{logo_path}"', ai_panel)

    def test_animation_category_uses_real_animation_and_game_tool_logos(self):
        animation_panel = skill_panel_markup("animation", "tools")
        for label, logo_path in (
            ("Blender", "images/logos/Blender.png"),
            ("Higgsfield", "images/logos/Higgsfield.png"),
            ("CapCut", "images/cap-cut-com-logo.webp"),
            ("Three.js", "images/logos/Three.js.svg"),
            ("Babylon.js", "images/logos/babylonjs.png"),
        ):
            self.assertIn(label, animation_panel)
            self.assertIn(f'src="{logo_path}"', animation_panel)

    def test_graphic_design_panel_is_composed_from_real_tool_logos(self):
        design_panel = skill_panel_markup("design", "animation")
        for label, logo_path in (
            ("Figma", "images/logos/Figma.svg"),
            ("Canva", "images/logos/Canva.svg"),
            ("GIMP", "images/logos/GIMP.svg"),
            ("Adobe Creative Cloud", "images/adobe-com-brandmark.svg"),
        ):
            self.assertIn(label, design_panel)
            self.assertIn(f'src="{logo_path}"', design_panel)
        self.assertNotIn("skill-icon-badge", design_panel)
        self.assertIn("Photoshop", design_panel)
        self.assertIn("Illustrator", design_panel)
        self.assertIn("InDesign", design_panel)

    def test_graphic_design_tools_use_an_editorial_canvas_instead_of_a_tile_grid(self):
        design_panel = skill_panel_markup("design", "animation")
        self.assertIn('class="design-tool-canvas"', design_panel)
        self.assertIn('class="design-tool-mark design-tool-mark-figma"', design_panel)
        self.assertNotIn("design-logo-grid", design_panel)
        self.assertNotIn("design-logo-tile", design_panel)

    def test_graphic_design_tab_has_a_decorative_monochrome_svg_mark(self):
        skills = section_markup("skills")
        design_tab = re.search(r'<button\b(?=[^>]*data-skill-target="design")[^>]*>(.*?)</button>', skills, re.DOTALL)
        self.assertIsNotNone(design_tab)
        self.assertIn('class="design-tab-doodle"', design_tab.group(1))
        self.assertIn("<svg", design_tab.group(1))
        self.assertRegex(CSS, r'\.skills-tab\[data-skill-target="design"\][\s\S]*?background:\s*#f5f1e9')

    def test_approach_uses_selected_local_design_artwork(self):
        approach = section_markup("approach")
        self.assertIn('class="approach-artboard"', approach)
        for image_path in (
            "images/design-brand-concept.svg",
            "images/design-social-concept.svg",
            "images/design-editorial-concept.svg",
        ):
            self.assertIn(f'src="{image_path}"', approach)
        self.assertEqual(approach.count('class="approach-art-piece'), 3)

    def test_approach_and_skill_refinements_inherit_the_site_font(self):
        approach_styles = CSS[CSS.index(".approach {"):CSS.index(".motion-showcase {")]
        self.assertNotIn("font-family", approach_styles)
        design_styles = CSS[CSS.index(".design-toolboard {"):CSS.index(".design-grid {")]
        self.assertNotIn("font-family", design_styles)

    def test_tools_panel_includes_the_existing_ide_logos(self):
        tools_panel = section_markup("skills").split('data-skill-panel="tools"', 1)[1]
        for label, logo_path in (
            ("Visual Studio Code", "images/logos/Visual Studio Code (VS Code).svg"),
            ("GitHub Codespaces", "images/logos/GitHub Codespaces.svg"),
            ("CodePen", "images/logos/CodePen.svg"),
        ):
            self.assertIn(label, tools_panel)
            self.assertIn(f'src="{logo_path}"', tools_panel)

    def test_skill_logo_paths_resolve_to_local_assets(self):
        skills = section_markup("skills")
        for logo_path in re.findall(r'<img\b[^>]*src="(images/[^\"]+)"', skills):
            with self.subTest(logo=logo_path):
                self.assertTrue((ROOT / logo_path).is_file(), f"Missing local skill logo: {logo_path}")

    def test_hero_portrait_has_no_decorative_gold_circle_at_any_breakpoint(self):
        hero = section_markup("home")
        self.assertNotIn("portrait-shape", hero)
        self.assertNotIn("portrait-shape", CSS)
        self.assertNotIn("#725a16", CSS)

    def test_cv_download_uses_the_requested_real_pdf_filename(self):
        contact = section_markup("contact")
        self.assertRegex(
            contact,
            r'<a\b[^>]*href="JANE%20N\.%20WAMBUGU\.pdf"[^>]*download="JANE N\. WAMBUGU\.pdf"',
        )
        pdf_path = ROOT / "JANE N. WAMBUGU.pdf"
        self.assertTrue(pdf_path.is_file(), "The CV download PDF must be present in the repository root")
        self.assertEqual(pdf_path.read_bytes()[:5], b"%PDF-", "The CV download must be a real PDF file")

    def test_design_promo_and_inquiry_form_are_removed_but_gallery_and_contact_remain(self):
        self.assertNotIn("Featured Design Work", HTML)
        self.assertNotIn("Explore the graphic design gallery", HTML)
        self.assertNotIn('id="clientInquiryForm"', HTML)
        self.assertIn('data-project-category="design"', HTML)
        contact = section_markup("contact")
        self.assertIn('href="mailto:jane@miraditechtribe.com"', contact)

    def test_approach_and_motion_animation_respect_reduced_motion_preference(self):
        self.assertRegex(CSS, r"@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.approach")
        reduced_motion = CSS[CSS.index("@media (prefers-reduced-motion: reduce)", CSS.index(".approach {")):]
        for obsolete_globe_rule in (".motion-artifact", ".motion-sphere", ".motion-orbit", ".motion-visual"):
            self.assertNotIn(obsolete_globe_rule, CSS)
        self.assertIn(".approach.scroll-visible .approach-stage", reduced_motion)
        self.assertIn("animation: none", reduced_motion)

    def test_existing_navigation_and_skills_and_project_initializers_remain_enabled(self):
        initializer = SCRIPT.split("function initializeApp() {", 1)[1].split("\n  }", 1)[0]
        self.assertIn("initSmoothScrolling();", initializer)
        self.assertIn("initSkillsTabs();", initializer)
        self.assertEqual(initializer.count("initProjectFilters();"), 1)
        self.assertNotIn("initContactLinks();", initializer)


if __name__ == "__main__":
    unittest.main()
