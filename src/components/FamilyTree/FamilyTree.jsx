import React, { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { useApp } from "../../context/AppContext";
import "./FamilyTree.css";

// Helper: label almarhum/almarhumah
function getAlmLabel(d) {
  if (!d.data.meninggal) return "";
  return d.data.jenis_kelamin === "L" ? " (Alm.)" : " (Almh.)";
}

// Branch config
const BRANCH = {
  root: { color: "#d4a853", dim: "rgba(212,168,83,0.15)", glow: "rgba(212,168,83,0.4)" },
  "indo-jani": { color: "#3b82f6", dim: "rgba(59,130,246,0.15)", glow: "rgba(59,130,246,0.4)" },
  "indo-sabi": { color: "#10b981", dim: "rgba(16,185,129,0.15)", glow: "rgba(16,185,129,0.4)" },
};

const NODE_W = 160;
const NODE_H = 70;
const NODE_GAP_X = 40;
const NODE_GAP_Y = 100;

// Flatten tree data for d3.hierarchy
function buildHierarchy(node, collapsed) {
  const isCollapsed = collapsed.has(node.id);
  return {
    ...node,
    children:
      !isCollapsed && node.anak?.length > 0
        ? node.anak.map((child) => buildHierarchy(child, collapsed))
        : undefined,
    _hasChildren: node.anak?.length > 0,
    _collapsed: isCollapsed,
  };
}

export default function FamilyTree() {
  const { setSelectedMember, silsilah } = useApp();
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [collapsed, setCollapsed] = useState(new Set());
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });

  // Track container size
  useEffect(() => {
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      setDimensions({
        width: entry.contentRect.width,
        height: Math.max(entry.contentRect.height, 600),
      });
    });
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const toggleCollapse = useCallback((id) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const hierarchyData = buildHierarchy(silsilah, collapsed);
    const root = d3.hierarchy(hierarchyData);

    // Tree layout
    const treeLayout = d3
      .tree()
      .nodeSize([NODE_W + NODE_GAP_X, NODE_H + NODE_GAP_Y])
      .separation((a, b) => (a.parent === b.parent ? 1.2 : 1.5));

    treeLayout(root);

    // Compute bounding box
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    root.each((d) => {
      if (d.x < minX) minX = d.x;
      if (d.x > maxX) maxX = d.x;
      if (d.y < minY) minY = d.y;
      if (d.y > maxY) maxY = d.y;
    });

    const treeW = maxX - minX + NODE_W + 80;
    const treeH = maxY - minY + NODE_H + 80;

    // SVG setup
    const svgEl = svg
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `${minX - (NODE_W / 2) - 40} ${minY - 40} ${treeW} ${treeH}`)
      .style("cursor", "grab");

    // Zoom & pan
    const zoom = d3.zoom().scaleExtent([0.3, 2]).on("zoom", (event) => {
      g.attr("transform", event.transform);
    });
    svg.call(zoom);

    const g = svgEl.append("g");

    // Defs (gradients, filters)
    const defs = svgEl.append("defs");
    Object.entries(BRANCH).forEach(([key, val]) => {
      const grad = defs.append("linearGradient")
        .attr("id", `grad-${key}`)
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "100%").attr("y2", "100%");
      grad.append("stop").attr("offset", "0%").attr("stop-color", val.color).attr("stop-opacity", 0.25);
      grad.append("stop").attr("offset", "100%").attr("stop-color", val.color).attr("stop-opacity", 0.08);

      const filter = defs.append("filter").attr("id", `glow-${key}`);
      filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "coloredBlur");
      const feMerge = filter.append("feMerge");
      feMerge.append("feMergeNode").attr("in", "coloredBlur");
      feMerge.append("feMergeNode").attr("in", "SourceGraphic");
    });

    // Links
    g.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "tree-link")
      .attr("d", d3.linkVertical().x((d) => d.x).y((d) => d.y))
      .attr("stroke", (d) => BRANCH[d.target.data.cabang]?.color || "#4b5563")
      .attr("stroke-opacity", 0.3)
      .attr("stroke-width", 1.5)
      .attr("fill", "none");

    // Nodes
    const node = g.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "tree-node")
      .attr("transform", (d) => `translate(${d.x},${d.y})`);

    // Node card background
    node.append("rect")
      .attr("x", -NODE_W / 2)
      .attr("y", -NODE_H / 2)
      .attr("width", NODE_W)
      .attr("height", NODE_H)
      .attr("rx", 12)
      .attr("fill", (d) => `url(#grad-${d.data.cabang})`)
      .attr("stroke", (d) => BRANCH[d.data.cabang]?.color || "#4b5563")
      .attr("stroke-opacity", 0.45)
      .attr("stroke-width", 1.2)
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        event.stopPropagation();
        const memberData = { ...d.data, _parentObj: d.parent ? d.parent.data : null };
        setSelectedMember(memberData);
      });

    // Hover glow
    node.select("rect")
      .on("mouseenter", function (event, d) {
        d3.select(this)
          .transition().duration(150)
          .attr("stroke-opacity", 0.9)
          .attr("stroke-width", 2);
      })
      .on("mouseleave", function (event, d) {
        d3.select(this)
          .transition().duration(150)
          .attr("stroke-opacity", 0.45)
          .attr("stroke-width", 1.2);
      });

    // Gender icon circle
    node.append("circle")
      .attr("cx", -NODE_W / 2 + 22)
      .attr("cy", 0)
      .attr("r", 16)
      .attr("fill", (d) => BRANCH[d.data.cabang]?.dim || "rgba(255,255,255,0.05)")
      .attr("stroke", (d) => BRANCH[d.data.cabang]?.color || "#4b5563")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1);

    node.append("text")
      .attr("x", -NODE_W / 2 + 22)
      .attr("y", 5)
      .attr("text-anchor", "middle")
      .attr("font-size", 14)
      .text((d) => (d.data.jenis_kelamin === "L" ? "👨" : "👩"));

    // Name
    node.append("text")
      .attr("x", -NODE_W / 2 + 46)
      .attr("y", -8)
      .attr("font-family", "Playfair Display, serif")
      .attr("font-size", 13)
      .attr("font-weight", "600")
      .attr("fill", (d) => d.data.meninggal ? "#94a3b8" : "#f1f5f9")
      .text((d) => {
        const name = d.data.nama;
        const alm = getAlmLabel(d);
        const full = name + alm;
        return full.length > 18 ? name.slice(0, 14) + "…" + alm : full;
      });

    // Subtitle (gelar / anak dari)
    node.append("text")
      .attr("x", -NODE_W / 2 + 46)
      .attr("y", 10)
      .attr("font-size", 10)
      .attr("fill", "#94a3b8")
      .text((d) => {
        let label = d.data.gelar || "";
        if (!label && d.parent) {
          const pName = d.parent.data.nama;
          if (d.parent.data.id === "la-nusu") {
            const ibu = d.data.cabang === "indo-jani" ? "Indo Jani" : d.data.cabang === "indo-sabi" ? "Indo Sabi" : "";
            label = ibu ? `Anak ${pName} & ${ibu}` : `Anak ${pName}`;
          } else {
            const spouse = d.parent.data.pasangan?.[0]?.nama;
            label = spouse ? `Anak ${pName} & ${spouse}` : `Anak ${pName}`;
          }
        }
        return label.length > 22 ? label.slice(0, 22) + "…" : label;
      });

    // Lahir year
    node.append("text")
      .attr("x", -NODE_W / 2 + 46)
      .attr("y", 24)
      .attr("font-size", 10)
      .attr("fill", "#475569")
      .text((d) => d.data.lahir ? `b. ${d.data.lahir}` : "");

    // Expand/Collapse button
    node.filter((d) => d.data._hasChildren)
      .append("g")
      .attr("class", "toggle-btn")
      .attr("transform", `translate(0, ${NODE_H / 2})`)
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        event.stopPropagation();
        toggleCollapse(d.data.id);
      })
      .call((g) => {
        g.append("circle")
          .attr("r", 10)
          .attr("fill", (d) => BRANCH[d.data.cabang]?.color || "#6b7280")
          .attr("fill-opacity", 0.2)
          .attr("stroke", (d) => BRANCH[d.data.cabang]?.color || "#6b7280")
          .attr("stroke-opacity", 0.6)
          .attr("stroke-width", 1.2);

        g.append("text")
          .attr("text-anchor", "middle")
          .attr("y", 4)
          .attr("font-size", 12)
          .attr("font-weight", "bold")
          .attr("fill", (d) => BRANCH[d.data.cabang]?.color || "#94a3b8")
          .text((d) => (d.data._collapsed ? "+" : "−"));
      });

    // Info button (top-right of card)
    node.append("text")
      .attr("x", NODE_W / 2 - 14)
      .attr("y", -NODE_H / 2 + 16)
      .attr("font-size", 11)
      .attr("fill", "#475569")
      .attr("text-anchor", "middle")
      .attr("cursor", "pointer")
      .text("ℹ")
      .on("click", (event, d) => {
        event.stopPropagation();
        setSelectedMember(d.data);
      });

  }, [collapsed, dimensions, setSelectedMember, toggleCollapse, silsilah]);

  return (
    <div className="family-tree-wrap" ref={containerRef}>
      <div className="family-tree-legend">
        <span className="legend-item legend-root">⬛ La Nusu (Root)</span>
        <span className="legend-item legend-a">🟦 Garis Indo Jani</span>
        <span className="legend-item legend-b">🟩 Garis Indo Sabi</span>
        <span className="legend-tip">💡 Klik nama untuk detail · Klik +/− untuk buka/tutup cabang · Scroll untuk zoom</span>
      </div>
      <svg ref={svgRef} className="family-tree-svg" />
    </div>
  );
}
