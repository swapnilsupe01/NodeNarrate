"""
HTML Template Generator for NodeNarrate standalone trace reports.
Produces a beautiful, self-contained single-file HTML trace viewer with zero external dependencies.
"""

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NodeNarrate Execution Trace</title>
  <style>
    :root {{
      --bg: #0b0f19;
      --card-bg: rgba(23, 31, 50, 0.85);
      --border: #2a3449;
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --accent: #6366f1;
      --node-color: #3b82f6;
      --tool-color: #10b981;
      --llm-color: #a855f7;
      --error-color: #ef4444;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      padding: 24px;
      line-height: 1.5;
    }}
    .container {{ max-width: 1100px; margin: 0 auto; }}
    .header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 24px;
    }}
    .title {{ font-size: 24px; font-weight: 700; display: flex; align-items: center; gap: 8px; }}
    .meta {{ color: var(--text-muted); font-size: 14px; }}
    .flow-card {{
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
      overflow-x: auto;
    }}
    .flow-title {{ font-size: 16px; font-weight: 600; margin-bottom: 14px; }}
    .flow-steps {{ display: flex; align-items: center; gap: 12px; min-width: max-content; }}
    .node-box {{
      background: #1e293b;
      border: 2px solid var(--node-color);
      border-radius: 8px;
      padding: 10px 16px;
      min-width: 140px;
      text-align: center;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }}
    .node-box:hover {{
      transform: translateY(-2px);
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
    }}
    .node-box.tool {{ border-color: var(--tool-color); }}
    .node-box.llm {{ border-color: var(--llm-color); }}
    .node-box.error {{ border-color: var(--error-color); }}
    .arrow {{ color: var(--text-muted); font-size: 20px; font-weight: bold; }}
    .steps-list {{ display: flex; flex-direction: column; gap: 12px; }}
    .step-item {{
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 16px;
      transition: border-color 0.2s;
    }}
    .step-item:hover {{ border-color: var(--accent); }}
    .step-header {{ display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }}
    .badge {{
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 3px 8px;
      border-radius: 4px;
      background: #374151;
    }}
    .badge.node {{ background: rgba(59, 130, 246, 0.2); color: #60a5fa; }}
    .badge.tool {{ background: rgba(16, 185, 129, 0.2); color: #34d399; }}
    .badge.llm {{ background: rgba(168, 85, 247, 0.2); color: #c084fc; }}
    .badge.error {{ background: rgba(239, 68, 68, 0.2); color: #f87171; }}
    .step-duration {{ margin-left: auto; font-size: 13px; color: var(--text-muted); }}
    .code-block {{
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 6px;
      padding: 10px;
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      font-size: 13px;
      color: #e2e8f0;
      white-space: pre-wrap;
      word-break: break-all;
      margin-top: 6px;
    }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title">🔍 NodeNarrate Execution Report</div>
      <div class="meta">Captured {total_steps} step(s) • Total Time: {total_duration}s</div>
    </div>

    <div class="flow-card">
      <div class="flow-title">Execution Sequence</div>
      <div class="flow-steps">
        {flow_boxes_html}
      </div>
    </div>

    <div class="steps-list">
      <div class="flow-title">Step-by-Step Inspector</div>
      {step_items_html}
    </div>
  </div>
</body>
</html>
"""


def generate_trace_html(trace_data: list) -> str:
    """Generates an offline HTML report for the trace data."""
    boxes = []
    items = []
    total_duration = 0.0

    for i, step in enumerate(trace_data):
        stype = step.get("type", "node")
        name = step.get("name", "node")
        duration = step.get("duration_sec") or 0.0
        total_duration += duration
        is_error = bool(step.get("error"))
        box_class = "error" if is_error else stype

        box_html = f'''
        <div class="node-box {box_class}">
          <div style="font-weight: 700; font-size: 14px;">{name}</div>
          <div style="font-size: 11px; color: var(--text-muted);">{stype} • {duration}s</div>
        </div>
        '''
        boxes.append(box_html)
        if i < len(trace_data) - 1:
            boxes.append('<div class="arrow">→</div>')

        input_str = str(step.get("input", ""))
        output_str = str(step.get("output", ""))
        err_str = step.get("error")

        err_html = f'<div style="margin-top:8px;"><strong style="color:var(--error-color)">Error:</strong><div class="code-block" style="color:#f87171">{err_str}</div></div>' if err_str else ''

        item_html = f'''
        <div class="step-item">
          <div class="step-header">
            <span style="color:var(--text-muted); font-weight:600;">#{i+1}</span>
            <span class="badge {stype}">{stype}</span>
            <span style="font-weight:700; font-size:15px;">{name}</span>
            <span class="step-duration">⏱️ {duration}s</span>
          </div>
          <div>
            <div style="font-size:12px; font-weight:600; color:var(--text-muted);">INPUT</div>
            <div class="code-block">{input_str}</div>
          </div>
          <div style="margin-top:8px;">
            <div style="font-size:12px; font-weight:600; color:var(--text-muted);">OUTPUT</div>
            <div class="code-block">{output_str}</div>
          </div>
          {err_html}
        </div>
        '''
        items.append(item_html)

    return HTML_TEMPLATE.format(
        total_steps=len(trace_data),
        total_duration=round(total_duration, 4),
        flow_boxes_html="\n".join(boxes) if boxes else "<div style='color:var(--text-muted)'>No execution steps.</div>",
        step_items_html="\n".join(items) if items else "<div style='color:var(--text-muted)'>No trace steps recorded.</div>",
    )
