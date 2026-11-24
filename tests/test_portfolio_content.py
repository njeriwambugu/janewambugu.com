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
    def test_contact_wheel_shows_discord_without_a_placeholder_profile_url(self):
        contact = section_markup("contact")
        self.assertIn('aria-label="Discord link coming soon"', contact)
        self.assertIn("<svg", contact)
        self.assertNotIn('aria-label="Facebook"', contact)
        self.assertNotRegex(contact, r'<a\b[^>]*href="[^"]*discord[^"]*"')

    def test_contact_wheel_replaces_stack_overflow_with_an_sms_link(self):
        contact = section_markup("contact")
        self.assertIn('href="sms:"', contact)
        self.assertIn('aria-label="SMS"', contact)
        self.assertNotIn('aria-label="Stack Overflow"', contact)
        self.assertNotIn(">SO</span>", contact)

    def test_soda_amount_dialog_does_not_claim_payment_is_enabled(self):
        nav = re.search(r'<nav\b[\s\S]*?</nav>', HTML).group(0)
        self.assertRegex(nav, r'<button\b(?=[^>]*aria-label="Buy me soda")(?=[^>]*class="[^"]*soda-can[^"]*")[^>]*>')
        self.assertIn('aria-haspopup="dialog"', nav)
        dialog = re.search(r'<dialog\b[\s\S]*?</dialog>', HTML)
        self.assertIsNotNone(dialog)
        self.assertIn('aria-labelledby="soda-dialog-title"', dialog.group(0))
        self.assertIn('id="soda-amount"', dialog.group(0))
        self.assertIn('for="soda-amount">Amount (KSh)</label>', dialog.group(0))
        self.assertIn("M-Pesa", dialog.group(0))
        self.assertIn("0725220846", dialog.group(0))
        self.assertIn('class="soda-copy-button"', dialog.group(0))
        self.assertIn('aria-live="polite"', dialog.group(0))
        self.assertIn("navigator.clipboard.writeText", SCRIPT)
        self.assertIn("Safaricom Daraja", dialog.group(0))
        self.assertIn("planned for a future update", dialog.group(0))
        self.assertRegex(dialog.group(0), r"(?i)(will not initiate|cannot initiate) payment")
        self.assertNotRegex(dialog.group(0), r"(?i)(pay now|stk push|payment confirmation enabled)")
        self.assertIn("dialog.showModal()", SCRIPT)
        self.assertIn("dialog.close()", SCRIPT)

    def test_skill_tab_order_matches_panel_order(self):
        skills = section_markup("skills")
        tab_targets = re.findall(r'data-skill-target="([^"]+)"', skills)
        panel_targets = re.findall(r'data-skill-panel="([^"]+)"', skills)
        self.assertEqual(tab_targets, panel_targets)

    def test_approach_section_and_navigation_links_are_removed(self):
        self.assertNotRegex(HTML, r'<section\b[^>]*\bid=["\']approach["\']')
        self.assertNotIn('href="#approach"', HTML)
        self.assertNotIn("My Approach", HTML)
        self.assertNotIn("approach", CSS.lower())

    def test_animation_category_uses_the_shared_skills_grid_and_contains_logos_only(self):
        skills = section_markup("skills")
        tab_targets = re.findall(r'data-skill-target="([^"]+)"', skills)
        design_index = tab_targets.index("design")
        self.assertEqual(tab_targets[design_index + 1], "animation")
        self.assertIn('data-skill-panel="animation"', skills)
        animation_panel = skill_panel_markup("animation", "tools")
        self.assertIn('class="skills-grid"', animation_panel)
        self.assertIn('class="skill-item"', animation_panel)
        self.assertNotIn("animation-tool-groups", animation_panel)
        self.assertNotIn("motion-copy", animation_panel)
        self.assertNotIn("3D &amp; Motion", animation_panel)
        self.assertIn("Blender", animation_panel)
        self.assertNotIn('id="motion"', HTML)

    def test_removed_approach_and_animation_copy_is_absent(self):
        self.assertNotIn("I start by understanding the goal", HTML)
        self.assertNotIn("form, light, materials and movement", HTML)
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

    def test_requested_tools_are_grouped_under_clear_skill_categories(self):
        skills = section_markup("skills")
        frontend_panel = skill_panel_markup("frontend", "backend")
        backend_panel = skill_panel_markup("backend", "ai")
        design_panel = skill_panel_markup("design", "animation")
        tools_panel = skills.split('data-skill-panel="tools"', 1)[1]

        self.assertIn('src="images/logos/wordpress-icon-alt.svg"', frontend_panel)
        self.assertIn("WordPress", frontend_panel)

        self.assertIn("Databases", backend_panel)
        self.assertIn('src="images/logos/supabase.svg"', backend_panel)
        self.assertIn("Supabase", backend_panel)
        self.assertIn("MongoDB", backend_panel)
        self.assertIn("MySQL", backend_panel)

        self.assertIn('src="images/logos/adobe-xd.svg"', design_panel)
        self.assertIn("Adobe XD", design_panel)
        self.assertIn('src="images/logos/adobe-indesign.svg"', design_panel)
        self.assertIn("InDesign", design_panel)

        vscode_index = tools_panel.index('<p class="skill-name">Visual Studio Code</p>')
        intellij_index = tools_panel.index('<p class="skill-name">IntelliJ IDEA</p>')
        self.assertEqual(
            tools_panel[vscode_index:intellij_index].count('class="skill-name"'), 1,
            "IntelliJ IDEA should be the next skill card after Visual Studio Code",
        )
        self.assertIn('src="images/logos/intellij-idea.svg"', tools_panel)
        self.assertIn('src="images/logos/antigravity.svg"', tools_panel)
        self.assertIn("Antigravity", tools_panel)

        planning_heading = tools_panel.index("Planning &amp; knowledge")
        notion_index = tools_panel.index("Notion")
        self.assertLess(planning_heading, notion_index)
        self.assertIn('src="images/logos/notion-icon.svg"', tools_panel)

    def test_ai_category_lists_all_available_ai_logos(self):
        skills = section_markup("skills")
        targets = re.findall(r'data-skill-target="([^"]+)"', skills)
        self.assertIn("ai", targets)
        ai_panel = skill_panel_markup("ai", "design")
        for label, logo_path in (
            ("Codex", "images/logos/ai/codex.svg"),
            ("GitHub Copilot", "images/logos/ai/githubcopilot.svg"),
            ("Gemini", "images/logos/ai/gemini-color.svg"),
            ("Claude Code", "images/logos/ai/claudecode-color.svg"),
            ("Z.ai", "images/logos/ai/zai.svg"),
            ("Kimi", "images/logos/ai/kimi-color.svg"),
            ("PyTorch", "images/logos/PyTorch.svg"),
            ("TensorFlow", "images/logos/TensorFlow.svg"),
            ("scikit-learn", "images/logos/scikit-learn.svg"),
            ("NumPy", "images/logos/NumPy.svg"),
            ("Higgsfield", "images/logos/Higgsfield.png"),
        ):
            self.assertIn(label, ai_panel)
            self.assertIn(f'src="{logo_path}"', ai_panel)

    def test_ai_category_prioritizes_named_assistants_and_groups_ml_libraries_separately(self):
        ai_panel = skill_panel_markup("ai", "design")
        self.assertIn("AI assistants &amp; coding tools", ai_panel)
        for assistant in ("GitHub Copilot", "Gemini", "Claude Code", "Z.ai", "Kimi", "Codex"):
            self.assertIn(assistant, ai_panel)
        self.assertIn('class="skills-grid" aria-label="AI assistants and coding tools"', ai_panel)
        self.assertGreaterEqual(ai_panel.count('class="skill-item"'), 6)
        self.assertNotIn("ai-assistant-board", ai_panel)
        self.assertNotIn("ai-tool-index", ai_panel)
        self.assertNotIn("ChatGPT", ai_panel)
        self.assertIn("ML &amp; data libraries", ai_panel)
        for library in ("PyTorch", "TensorFlow", "scikit-learn", "NumPy"):
            self.assertIn(library, ai_panel)
        self.assertIn("Higgsfield", ai_panel)

    def test_graphic_design_panel_omits_the_two_removed_intro_lines(self):
        design_panel = skill_panel_markup("design", "animation")
        self.assertNotIn("A visual toolkit for shaping clear, distinctive work", design_panel)
        self.assertNotIn("Concept, craft, and polish", design_panel)

    def test_graphic_design_tab_uses_shared_tab_styling_without_a_doodle(self):
        skills = section_markup("skills")
        design_tab = re.search(r'<button\b(?=[^>]*data-skill-target="design")[^>]*>(.*?)</button>', skills, re.DOTALL)
        self.assertIsNotNone(design_tab)
        self.assertEqual(re.sub(r"<[^>]+>", "", design_tab.group(1)).strip(), "Graphic Design")
        self.assertNotIn("design-tab-doodle", design_tab.group(1))
        self.assertNotIn("designDoodleDraw", CSS)

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

    def test_graphic_design_tab_has_the_standard_text_label(self):
        skills = section_markup("skills")
        design_tab = re.search(r'<button\b(?=[^>]*data-skill-target="design")[^>]*>(.*?)</button>', skills, re.DOTALL)
        self.assertIsNotNone(design_tab)
        self.assertEqual(re.sub(r"<[^>]+>", "", design_tab.group(1)).strip(), "Graphic Design")
        self.assertNotIn("design-tab-doodle", design_tab.group(1))

    def test_approach_design_study_is_no_longer_rendered(self):
        self.assertNotIn('id="approach"', HTML)
        self.assertNotIn("approach-art-piece", HTML)
        self.assertNotIn('aria-label="Selected graphic design studies"', HTML)

    def test_graphic_design_skill_refinement_inherits_the_site_font(self):
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

    def test_removed_approach_and_animation_styles_are_absent(self):
        self.assertIn("@media (prefers-reduced-motion: reduce)", CSS)
        for obsolete_selector in (".approach", ".motion-showcase", ".motion-tools", ".animation-tool-groups"):
            self.assertNotIn(obsolete_selector, CSS)

    def test_existing_navigation_and_skills_and_project_initializers_remain_enabled(self):
        initializer = SCRIPT.split("function initializeApp() {", 1)[1].split("\n  }", 1)[0]
        self.assertIn("initSmoothScrolling();", initializer)
        self.assertIn("initSkillsTabs();", initializer)
        self.assertIn("initSodaDialog();", initializer)
        self.assertEqual(initializer.count("initProjectFilters();"), 1)
        self.assertNotIn("initContactLinks();", initializer)



if __name__ == "__main__":
    unittest.main()
