def sub(p, pairs):
    s = open(p, encoding='utf8').read()
    for a, b in pairs:
        if a not in s:
            print('MISSING in', p, ':', a[:80])
        s = s.replace(a, b)
    open(p, 'w', encoding='utf8').write(s)

# row copy as in the target
sub('src/content/copy.ts', [
    ("text: 'Data entry, follow-ups, reports, handovers. The work your team repeats every day, automated end to end.',", "text: 'Data entry, follow-ups, reports, handovers. Automated end to end.',"),
    ("text: 'Before any code, I map where the time and money actually go. If the right fix is a better process, you hear that first.',", "text: 'I map where the time and money go first. Sometimes the fix is a better process.',"),
])
# the faint wall layer sits first inside <main>
sub('src/pages/index.astro', [("  <main id=\"main\">", "  <main id=\"main\">\n    <video class=\"wallfaint\" muted loop playsinline preload=\"none\" aria-hidden=\"true\" tabindex=\"-1\" poster=\"/img/wall-blur.webp\"></video>")])
# the hero script loads and plays that video only once the page has covered the hero (desktop, not poster-only)
sub('src/components/Hero.astro', [
    ("    if (faint) faint.style.opacity = String((0.16 * Math.min(1, Math.max(0, (scrollY - innerHeight * 0.35) / (innerHeight * 0.5)))).toFixed(3));",
     "    if (faint) {\n      const fo = 0.16 * Math.min(1, Math.max(0, (scrollY - innerHeight * 0.35) / (innerHeight * 0.5)));\n      faint.style.opacity = fo.toFixed(3);\n      if (fo > 0 && !posterOnly && matchMedia('(min-width: 900px)').matches) {\n        if (!faint.dataset.ready) {\n          faint.dataset.ready = '1';\n          for (const [type, ext] of [['video/webm', 'webm'], ['video/mp4', 'mp4']] as const) {\n            const s = document.createElement('source');\n            s.src = `/video/wall-light.${ext}`;\n            s.type = type;\n            faint.append(s);\n          }\n          faint.load();\n        }\n        (faint as HTMLVideoElement).play().catch(() => {});\n      } else if (fo === 0) (faint as HTMLVideoElement).pause();\n    }"),
])
