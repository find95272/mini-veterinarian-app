'use client';

import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import type { SpeciesId } from '@/lib/speciesKnowledge';

/* ============================================================
 *  Shared SVG helpers
 * ============================================================ */

function Label({ x, y, text, highlight = false }: { x: number; y: number; text: string; highlight?: boolean }) {
  return (
    <>
      <circle cx={x} cy={y} r="3.5" className={highlight ? 'diagram-fill-warning' : 'diagram-fill-primary'} />
      <text x={x + 8} y={y + 4} className="diagram-text">{text}</text>
    </>
  );
}

function HotSpot({
  x, y, r = 14, label, onClick, active,
}: {
  x: number; y: number; r?: number; label: string; onClick: () => void; active: boolean;
}) {
  return (
    <g onClick={onClick} className="cursor-pointer" role="button" aria-label={label}>
      <circle
        cx={x} cy={y} r={r}
        className={active ? 'diagram-fill-warning' : 'diagram-fill-primary'}
        opacity={active ? 0.9 : 0.45}
        style={{ transition: 'opacity 0.2s' }}
      />
      <text x={x} y={y - r - 4} textAnchor="middle" className="diagram-label">{label}</text>
    </g>
  );
}

/* ============================================================
 *  1. Species Anatomy Reference Diagrams
 *     Labeled simplified anatomy with problem-area highlights
 * ============================================================ */

interface AnatomyArea {
  x: number; y: number; label: string; problem: boolean;
}

const ANATOMY_AREAS: Record<SpeciesId, { body: React.ReactNode; areas: AnatomyArea[] }> = {
  cat: {
    body: (
      <g>
        <ellipse cx="140" cy="110" rx="55" ry="32" className="diagram-fill-primary" />
        <circle cx="200" cy="88" r="24" className="diagram-fill-primary" />
        <path d="M188 68 L183 52 L198 66 Z" className="diagram-fill-primary" />
        <path d="M212 68 L217 52 L207 66 Z" className="diagram-fill-primary" />
        <line x1="90" y1="100" x2="72" y2="132" className="diagram-stroke" />
        <line x1="92" y1="122" x2="74" y2="152" className="diagram-stroke" />
        <line x1="190" y1="132" x2="185" y2="162" className="diagram-stroke" />
        <line x1="210" y1="132" x2="215" y2="162" className="diagram-stroke" />
        <path d="M85 110 Q70 100 78 88" className="diagram-stroke" />
      </g>
    ),
    areas: [
      { x: 200, y: 80, label: '耳朵', problem: true },
      { x: 205, y: 95, label: '牙齿/口腔', problem: true },
      { x: 140, y: 85, label: '背部/脊柱', problem: false },
      { x: 125, y: 125, label: '消化道', problem: true },
      { x: 80, y: 138, label: '关节', problem: true },
      { x: 140, y: 110, label: '泌尿道', problem: true },
    ],
  },
  dog: {
    body: (
      <g>
        <ellipse cx="135" cy="110" rx="58" ry="28" className="diagram-fill-primary" />
        <circle cx="210" cy="92" r="26" className="diagram-fill-primary" />
        <path d="M196 70 L191 54 L208 68 Z" className="diagram-fill-primary" />
        <line x1="82" y1="105" x2="62" y2="138" className="diagram-stroke" />
        <line x1="88" y1="125" x2="68" y2="155" className="diagram-stroke" />
        <line x1="180" y1="130" x2="175" y2="163" className="diagram-stroke" />
        <line x1="200" y1="130" x2="205" y2="163" className="diagram-stroke" />
        <path d="M78 108 Q60 95 70 82" className="diagram-stroke" />
      </g>
    ),
    areas: [
      { x: 210, y: 85, label: '耳朵', problem: true },
      { x: 218, y: 100, label: '口鼻/牙齿', problem: true },
      { x: 135, y: 85, label: '脊柱/背部', problem: false },
      { x: 115, y: 120, label: '消化道', problem: true },
      { x: 72, y: 142, label: '关节', problem: true },
      { x: 135, y: 110, label: '心脏/肺部', problem: true },
    ],
  },
  rabbit: {
    body: (
      <g>
        <ellipse cx="140" cy="115" rx="50" ry="28" className="diagram-fill-primary" />
        <circle cx="200" cy="95" r="20" className="diagram-fill-primary" />
        <ellipse cx="195" cy="58" rx="7" ry="22" className="diagram-fill-primary" />
        <ellipse cx="210" cy="58" rx="7" ry="22" className="diagram-fill-primary" />
        <line x1="98" y1="120" x2="84" y2="150" className="diagram-stroke" />
        <line x1="180" y1="135" x2="175" y2="165" className="diagram-stroke" />
        <line x1="195" y1="135" x2="200" y2="165" className="diagram-stroke" />
      </g>
    ),
    areas: [
      { x: 202, y: 50, label: '耳朵', problem: true },
      { x: 200, y: 95, label: '牙齿', problem: true },
      { x: 140, y: 90, label: '背部', problem: false },
      { x: 120, y: 120, label: '消化道', problem: true },
      { x: 86, y: 145, label: '关节', problem: true },
      { x: 140, y: 115, label: '泌尿道', problem: true },
    ],
  },
  rodent: {
    body: (
      <g>
        <ellipse cx="135" cy="115" rx="42" ry="24" className="diagram-fill-primary" />
        <circle cx="188" cy="105" r="17" className="diagram-fill-primary" />
        <circle cx="182" cy="95" r="3" className="diagram-fill-warning" />
        <line x1="98" y1="125" x2="88" y2="150" className="diagram-stroke" />
        <line x1="165" y1="135" x2="160" y2="158" className="diagram-stroke" />
      </g>
    ),
    areas: [
      { x: 188, y: 105, label: '头部/颊囊', problem: true },
      { x: 182, y: 92, label: '牙齿', problem: true },
      { x: 135, y: 95, label: '背部', problem: false },
      { x: 118, y: 122, label: '消化道', problem: true },
      { x: 90, y: 145, label: '关节', problem: true },
      { x: 135, y: 115, label: '皮肤', problem: true },
    ],
  },
  bird: {
    body: (
      <g>
        <ellipse cx="135" cy="110" rx="33" ry="42" className="diagram-fill-primary" />
        <circle cx="172" cy="73" r="14" className="diagram-fill-primary" />
        <path d="M182 73 L202 76 L182 80 Z" className="diagram-fill-warning" />
        <path d="M105 100 Q75 80 90 120" className="diagram-stroke" />
        <path d="M165 152 L160 172 L170 172 Z" className="diagram-fill-primary" />
      </g>
    ),
    areas: [
      { x: 172, y: 73, label: '头部/喙', problem: true },
      { x: 135, y: 88, label: '胸部/嗉囊', problem: true },
      { x: 135, y: 125, label: '腹部/消化道', problem: true },
      { x: 95, y: 105, label: '翅膀/关节', problem: true },
      { x: 135, y: 145, label: '泄殖腔', problem: true },
      { x: 135, y: 110, label: '呼吸道', problem: true },
    ],
  },
  reptile: {
    body: (
      <g>
        <ellipse cx="115" cy="110" rx="38" ry="26" className="diagram-fill-primary" />
        <circle cx="168" cy="100" r="14" className="diagram-fill-primary" />
        <path d="M77 110 Q57 120 67 135" className="diagram-stroke" />
        <line x1="148" y1="125" x2="143" y2="150" className="diagram-stroke" />
        <line x1="130" y1="135" x2="125" y2="155" className="diagram-stroke" />
      </g>
    ),
    areas: [
      { x: 168, y: 100, label: '头部/眼睛', problem: true },
      { x: 115, y: 90, label: '背甲/壳', problem: true },
      { x: 115, y: 122, label: '腹甲', problem: false },
      { x: 100, y: 110, label: '消化道', problem: true },
      { x: 65, y: 128, label: '尾部', problem: false },
      { x: 135, y: 145, label: '关节', problem: true },
    ],
  },
  fish: {
    body: (
      <g>
        <path d="M75 110 Q135 78 195 110 Q135 142 75 110 Z" className="diagram-fill-primary" />
        <path d="M195 110 L225 90 L220 110 L225 130 Z" className="diagram-fill-primary" />
        <circle cx="180" cy="100" r="4" className="diagram-fill-warning" />
        <path d="M135 83 L140 73 L150 83 Z" className="diagram-fill-primary" />
        <path d="M135 137 L140 147 L150 137 Z" className="diagram-fill-primary" />
      </g>
    ),
    areas: [
      { x: 180, y: 100, label: '眼睛', problem: true },
      { x: 120, y: 100, label: '鳃部', problem: true },
      { x: 100, y: 125, label: '腹部/消化道', problem: true },
      { x: 150, y: 110, label: '体表/鳞片', problem: true },
      { x: 220, y: 110, label: '尾鳍', problem: false },
      { x: 135, y: 88, label: '背鳍', problem: false },
    ],
  },
  ferret: {
    body: (
      <g>
        <ellipse cx="125" cy="110" rx="52" ry="20" className="diagram-fill-primary" />
        <circle cx="192" cy="100" r="16" className="diagram-fill-primary" />
        <path d="M184 85 L179 72 L192 82 Z" className="diagram-fill-primary" />
        <line x1="78" y1="115" x2="58" y2="135" className="diagram-stroke" />
        <line x1="172" y1="125" x2="167" y2="155" className="diagram-stroke" />
        <line x1="188" y1="125" x2="193" y2="155" className="diagram-stroke" />
      </g>
    ),
    areas: [
      { x: 192, y: 100, label: '头部/耳朵', problem: true },
      { x: 195, y: 110, label: '牙齿', problem: true },
      { x: 125, y: 90, label: '背部/肾上腺', problem: true },
      { x: 110, y: 118, label: '消化道', problem: true },
      { x: 62, y: 138, label: '关节', problem: true },
      { x: 125, y: 110, label: '胰腺', problem: true },
    ],
  },
};

export function AnatomyDiagram({ species, className = '' }: { species: SpeciesId; className?: string }) {
  const data = ANATOMY_AREAS[species];
  if (!data) return null;
  return (
    <div className={`bg-card rounded-2xl border border-border p-4 ${className}`}>
      <h4 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
        <span className="w-1.5 h-4 rounded-full bg-primary" />
        物种解剖示意图
      </h4>
      <p className="text-[11px] text-muted-foreground mb-3">黄色标记为常见问题区域</p>
      <svg viewBox="0 0 280 190" className="w-full max-w-sm mx-auto" role="img" aria-label={`${species} anatomy diagram`}>
        <title>{`${species} 解剖示意图`}</title>
        <desc>标记了常见问题区域的简化解剖图</desc>
        {data.body}
        {data.areas.map((a, i) => (
          <Label key={i} x={a.x} y={a.y} text={a.label} highlight={a.problem} />
        ))}
      </svg>
      <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-primary/30 border border-primary inline-block" />一般区域</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-warning/30 border border-warning inline-block" />常见问题区域</span>
      </div>
    </div>
  );
}

/* ============================================================
 *  2. Symptom Location Map — clickable SVG body map
 * ============================================================ */

const BODY_AREAS: Record<SpeciesId, { x: number; y: number; r: number; label: string; symptomKey: string }[]> = {
  cat: [
    { x: 200, y: 80, r: 16, label: '耳朵', symptomKey: 'appearance' },
    { x: 205, y: 95, r: 14, label: '口腔/牙齿', symptomKey: 'eating' },
    { x: 140, y: 85, r: 16, label: '背部/脊柱', symptomKey: 'neuro' },
    { x: 125, y: 125, r: 16, label: '消化道', symptomKey: 'excretion' },
    { x: 80, y: 138, r: 14, label: '四肢/关节', symptomKey: 'behavior' },
    { x: 140, y: 110, r: 14, label: '呼吸/心脏', symptomKey: 'respiratory' },
  ],
  dog: [
    { x: 210, y: 85, r: 16, label: '耳朵', symptomKey: 'appearance' },
    { x: 218, y: 100, r: 14, label: '口鼻', symptomKey: 'eating' },
    { x: 135, y: 85, r: 16, label: '脊柱', symptomKey: 'neuro' },
    { x: 115, y: 120, r: 16, label: '消化道', symptomKey: 'excretion' },
    { x: 72, y: 142, r: 14, label: '关节', symptomKey: 'behavior' },
    { x: 135, y: 110, r: 14, label: '心肺', symptomKey: 'respiratory' },
  ],
  rabbit: [
    { x: 202, y: 50, r: 12, label: '耳朵', symptomKey: 'appearance' },
    { x: 200, y: 95, r: 14, label: '牙齿', symptomKey: 'eating' },
    { x: 140, y: 90, r: 14, label: '背部', symptomKey: 'neuro' },
    { x: 120, y: 120, r: 14, label: '消化道', symptomKey: 'excretion' },
    { x: 86, y: 145, r: 12, label: '关节', symptomKey: 'behavior' },
    { x: 140, y: 115, r: 12, label: '呼吸', symptomKey: 'respiratory' },
  ],
  rodent: [
    { x: 188, y: 105, r: 14, label: '头部/颊囊', symptomKey: 'appearance' },
    { x: 182, y: 92, r: 10, label: '牙齿', symptomKey: 'eating' },
    { x: 135, y: 95, r: 14, label: '背部', symptomKey: 'neuro' },
    { x: 118, y: 122, r: 14, label: '消化道', symptomKey: 'excretion' },
    { x: 90, y: 145, r: 12, label: '关节', symptomKey: 'behavior' },
    { x: 135, y: 115, r: 12, label: '皮肤', symptomKey: 'respiratory' },
  ],
  bird: [
    { x: 172, y: 73, r: 12, label: '头部/喙', symptomKey: 'eating' },
    { x: 135, y: 88, r: 14, label: '嗉囊', symptomKey: 'excretion' },
    { x: 135, y: 125, r: 14, label: '腹部', symptomKey: 'excretion' },
    { x: 95, y: 105, r: 14, label: '翅膀', symptomKey: 'behavior' },
    { x: 135, y: 110, r: 12, label: '呼吸', symptomKey: 'respiratory' },
    { x: 135, y: 145, r: 10, label: '泄殖腔', symptomKey: 'appearance' },
  ],
  reptile: [
    { x: 168, y: 100, r: 12, label: '头部/眼睛', symptomKey: 'appearance' },
    { x: 115, y: 90, r: 14, label: '背甲', symptomKey: 'appearance' },
    { x: 100, y: 110, r: 14, label: '消化道', symptomKey: 'excretion' },
    { x: 65, y: 128, r: 12, label: '尾部', symptomKey: 'behavior' },
    { x: 135, y: 145, r: 12, label: '关节', symptomKey: 'neuro' },
    { x: 115, y: 110, r: 12, label: '呼吸', symptomKey: 'respiratory' },
  ],
  fish: [
    { x: 180, y: 100, r: 10, label: '眼睛', symptomKey: 'appearance' },
    { x: 120, y: 100, r: 14, label: '鳃部', symptomKey: 'respiratory' },
    { x: 100, y: 125, r: 14, label: '腹部', symptomKey: 'excretion' },
    { x: 150, y: 110, r: 16, label: '体表', symptomKey: 'appearance' },
    { x: 220, y: 110, r: 12, label: '尾鳍', symptomKey: 'behavior' },
    { x: 135, y: 88, r: 10, label: '背鳍', symptomKey: 'neuro' },
  ],
  ferret: [
    { x: 192, y: 100, r: 12, label: '头部', symptomKey: 'appearance' },
    { x: 195, y: 110, r: 10, label: '牙齿', symptomKey: 'eating' },
    { x: 125, y: 90, r: 16, label: '肾上腺', symptomKey: 'behavior' },
    { x: 110, y: 118, r: 14, label: '消化道', symptomKey: 'excretion' },
    { x: 62, y: 138, r: 12, label: '关节', symptomKey: 'neuro' },
    { x: 125, y: 110, r: 12, label: '胰腺', symptomKey: 'eating' },
  ],
};

export function SymptomLocationMap({
  species, onAreaClick, selectedAreas = [], className = '',
}: {
  species: SpeciesId;
  onAreaClick: (symptomKey: string) => void;
  selectedAreas?: string[];
  className?: string;
}) {
  const areas = BODY_AREAS[species];
  if (!areas) return null;
  const body = ANATOMY_AREAS[species]?.body;
  return (
    <div className={`bg-card rounded-2xl border border-border p-4 ${className}`}>
      <h4 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
        <span className="w-1.5 h-4 rounded-full bg-primary" />
        症状定位图
      </h4>
      <p className="text-[11px] text-muted-foreground mb-3">点击图中标记区域选择对应症状</p>
      <svg viewBox="0 0 280 190" className="w-full max-w-sm mx-auto" role="img" aria-label={`${species} symptom location map`}>
        <title>{`${species} 症状定位图`}</title>
        <desc>可点击的身体区域图，点击后选择对应症状类别</desc>
        {body}
        {areas.map((a, i) => (
          <HotSpot
            key={i}
            x={a.x} y={a.y} r={a.r}
            label={a.label}
            onClick={() => onAreaClick(a.symptomKey)}
            active={selectedAreas.includes(a.symptomKey)}
          />
        ))}
      </svg>
    </div>
  );
}

/* ============================================================
 *  3. Step-by-step Visual Care Guides
 *     SVG/illustrated cards for specific care procedures
 * ============================================================ */

interface CareStep {
  num: number;
  title: string;
  desc: string;
  icon: React.ReactNode;
}

function GumCheckSVG() {
  return (
    <svg viewBox="0 0 60 40" className="w-14 h-10" role="img" aria-label="牙龈检查">
      <title>牙龈检查示意</title>
      <ellipse cx="30" cy="22" rx="22" ry="12" className="diagram-fill-primary" />
      <path d="M12 22 Q30 14 48 22" className="diagram-stroke" />
      <path d="M14 22 Q30 28 46 22" fill="hsl(var(--primary) / 0.3)" stroke="hsl(var(--primary))" strokeWidth="1" />
      <circle cx="30" cy="22" r="3" className="diagram-fill-warning" />
    </svg>
  );
}

function ThermometerSVG() {
  return (
    <svg viewBox="0 0 60 40" className="w-14 h-10" role="img" aria-label="量体温">
      <title>量体温示意</title>
      <rect x="24" y="8" width="6" height="24" rx="3" className="diagram-fill-primary" />
      <circle cx="27" cy="32" r="6" className="diagram-fill-danger" />
      <rect x="25" y="12" width="4" height="16" fill="hsl(var(--destructive) / 0.5)" />
    </svg>
  );
}

function PillSVG() {
  return (
    <svg viewBox="0 0 60 40" className="w-14 h-10" role="img" aria-label="喂药">
      <title>喂药示意</title>
      <ellipse cx="30" cy="20" rx="16" ry="8" className="diagram-fill-primary" />
      <line x1="30" y1="12" x2="30" y2="28" stroke="hsl(var(--primary))" strokeWidth="1.5" />
      <rect x="10" y="16" width="6" height="8" rx="2" className="diagram-fill-warning" />
    </svg>
  );
}

function EyeDropSVG() {
  return (
    <svg viewBox="0 0 60 40" className="w-14 h-10" role="img" aria-label="滴眼液">
      <title>滴眼液示意</title>
      <ellipse cx="30" cy="20" rx="20" ry="10" className="diagram-fill-primary" />
      <circle cx="30" cy="18" r="4" className="diagram-fill-primary" />
      <circle cx="30" cy="18" r="2" fill="hsl(var(--primary))" />
      <ellipse cx="30" cy="8" rx="3" ry="2" className="diagram-fill-primary" />
      <line x1="30" y1="10" x2="30" y2="14" stroke="hsl(var(--primary))" strokeWidth="1" />
    </svg>
  );
}

function SkinTentSVG() {
  return (
    <svg viewBox="0 0 60 40" className="w-14 h-10" role="img" aria-label="脱水皮褶测试">
      <title>脱水皮褶测试示意</title>
      <path d="M10 28 Q20 12 30 28 Q40 12 50 28" className="diagram-stroke" />
      <path d="M20 20 L25 16 L30 20" fill="none" stroke="hsl(var(--warning))" strokeWidth="1.5" />
    </svg>
  );
}

const CARE_GUIDES: Record<string, CareStep[]> = {
  gum: [
    { num: 1, title: '轻翻嘴唇', desc: '用非惯用手轻翻上唇，暴露牙龈', icon: <GumCheckSVG /> },
    { num: 2, title: '观察颜色', desc: '粉红=正常，苍白=贫血/失血，发白=缺血', icon: <GumCheckSVG /> },
    { num: 3, title: '按压回血测试', desc: '用手指按压牙龈变白后松开，应在1-2秒内恢复粉红', icon: <GumCheckSVG /> },
    { num: 4, title: '判断脱水', desc: '回血时间>2秒=脱水或休克，需立即就医', icon: <GumCheckSVG /> },
  ],
  temp: [
    { num: 1, title: '准备体温计', desc: '使用宠物电子肛温计，涂抹润滑剂（凡士林）', icon: <ThermometerSVG /> },
    { num: 2, title: '稳定宠物', desc: '让宠物保持站立或侧卧，由另一人协助固定', icon: <ThermometerSVG /> },
    { num: 3, title: '插入测量', desc: '轻柔插入约1-2cm，等待蜂鸣提示', icon: <ThermometerSVG /> },
    { num: 4, title: '读取判断', desc: '猫正常38-39°C，狗38-39.2°C；>39.5°C为发热', icon: <ThermometerSVG /> },
  ],
  pill: [
    { num: 1, title: '固定姿势', desc: '从后方握住宠物头部，用拇指和食指撑开口腔', icon: <PillSVG /> },
    { num: 2, title: '放置药片', desc: '将药片放在舌根处，越深越好', icon: <PillSVG /> },
    { num: 3, title: '合嘴吞咽', desc: '合上嘴巴，轻抚喉部或向鼻孔吹气刺激吞咽', icon: <PillSVG /> },
    { num: 4, title: '确认服药', desc: '观察是否舔嘴唇确认吞下；如吐出需重新给药', icon: <PillSVG /> },
  ],
  eye: [
    { num: 1, title: '清洁眼部', desc: '用生理盐水棉球清理眼周分泌物', icon: <EyeDropSVG /> },
    { num: 2, title: '固定头部', desc: '一手从后方轻固定头部，使眼朝上', icon: <EyeDropSVG /> },
    { num: 3, title: '滴入药液', desc: '拉开上眼睑，将药液滴入眼穹窿，避免触碰瓶口', icon: <EyeDropSVG /> },
    { num: 4, title: '闭眼按摩', desc: '轻合眼睑10秒，帮助药液均匀分布', icon: <EyeDropSVG /> },
  ],
  dehydration: [
    { num: 1, title: '捏起颈背皮肤', desc: '在肩胛之间捏起一块皮肤，轻轻向上拉', icon: <SkinTentSVG /> },
    { num: 2, title: '松手观察', desc: '松手后皮肤应立即回弹恢复平坦', icon: <SkinTentSVG /> },
    { num: 3, title: '判断弹性', desc: '回弹慢（>2秒）=中度脱水；保持褶皱=严重脱水', icon: <SkinTentSVG /> },
    { num: 4, title: '紧急程度', desc: '严重脱水需立即就医补液，不可仅口服补水', icon: <SkinTentSVG /> },
  ],
};

const GUIDE_TITLES: Record<string, string> = {
  gum: '如何看牙龈颜色判断贫血/脱水',
  temp: '如何给宠物量体温',
  pill: '如何喂药',
  eye: '如何滴眼药水',
  dehydration: '识别脱水皮褶测试',
};

export function CareStepGuide({
  guideKey = 'gum',
  className = '',
}: {
  guideKey?: string;
  className?: string;
}) {
  const steps = CARE_GUIDES[guideKey] || CARE_GUIDES.gum;
  return (
    <div className={`bg-card rounded-2xl border border-border p-4 ${className}`}>
      <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <span className="w-1.5 h-4 rounded-full bg-primary" />
        {GUIDE_TITLES[guideKey] || '护理操作步骤图解'}
      </h4>
      <div className="space-y-3">
        {steps.map((s) => (
          <div key={s.num} className="flex items-start gap-3 p-2 rounded-xl hover:bg-secondary/30 transition-colors">
            <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center flex-shrink-0">
              {s.num}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground">{s.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.desc}</div>
            </div>
            <div className="flex-shrink-0">{s.icon}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CareGuideSelector({ className = '' }: { className?: string }) {
  const [selected, setSelected] = useState<string>('gum');
  return (
    <div className={className}>
      <div className="flex gap-2 overflow-x-auto pb-1 mb-3">
        {Object.keys(GUIDE_TITLES).map((key) => (
          <button
            key={key}
            onClick={() => setSelected(key)}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
              selected === key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
            }`}
          >
            {GUIDE_TITLES[key]}
          </button>
        ))}
      </div>
      <CareStepGuide guideKey={selected} />
    </div>
  );
}

/* ============================================================
 *  4. Dosage / Weight Reference Charts (Recharts)
 * ============================================================ */

interface DosageRow {
  weight: string;
  amoxicillin: number;
  metronidazole: number;
  meloxicam: number;
}

const DOSAGE_DATA: Record<string, DosageRow[]> = {
  cat: [
    { weight: '2kg', amoxicillin: 25, metronidazole: 15, meloxicam: 0.2 },
    { weight: '4kg', amoxicillin: 50, metronidazole: 30, meloxicam: 0.4 },
    { weight: '6kg', amoxicillin: 75, metronidazole: 45, meloxicam: 0.6 },
    { weight: '8kg', amoxicillin: 100, metronidazole: 60, meloxicam: 0.8 },
  ],
  dog: [
    { weight: '5kg', amoxicillin: 62.5, metronidazole: 37.5, meloxicam: 0.5 },
    { weight: '10kg', amoxicillin: 125, metronidazole: 75, meloxicam: 1 },
    { weight: '20kg', amoxicillin: 250, metronidazole: 150, meloxicam: 2 },
    { weight: '40kg', amoxicillin: 500, metronidazole: 300, meloxicam: 4 },
  ],
  rabbit: [
    { weight: '1kg', amoxicillin: 0, metronidazole: 0, meloxicam: 0.3 },
    { weight: '2kg', amoxicillin: 0, metronidazole: 0, meloxicam: 0.6 },
    { weight: '3kg', amoxicillin: 0, metronidazole: 0, meloxicam: 0.9 },
    { weight: '5kg', amoxicillin: 0, metronidazole: 0, meloxicam: 1.5 },
  ],
  ferret: [
    { weight: '0.5kg', amoxicillin: 5, metronidazole: 0, meloxicam: 0.05 },
    { weight: '1kg', amoxicillin: 10, metronidazole: 0, meloxicam: 0.1 },
    { weight: '1.5kg', amoxicillin: 15, metronidazole: 0, meloxicam: 0.15 },
    { weight: '2kg', amoxicillin: 20, metronidazole: 0, meloxicam: 0.2 },
  ],
  rodent: [
    { weight: '0.1kg', amoxicillin: 0, metronidazole: 0, meloxicam: 0.03 },
    { weight: '0.3kg', amoxicillin: 0, metronidazole: 0, meloxicam: 0.09 },
    { weight: '0.5kg', amoxicillin: 0, metronidazole: 0, meloxicam: 0.15 },
    { weight: '1kg', amoxicillin: 0, metronidazole: 0, meloxicam: 0.3 },
  ],
  bird: [
    { weight: '0.05kg', amoxicillin: 0, metronidazole: 0, meloxicam: 0 },
    { weight: '0.1kg', amoxicillin: 2.5, metronidazole: 0, meloxicam: 0 },
    { weight: '0.3kg', amoxicillin: 7.5, metronidazole: 0, meloxicam: 0 },
    { weight: '0.5kg', amoxicillin: 12.5, metronidazole: 0, meloxicam: 0 },
  ],
  reptile: [
    { weight: '0.1kg', amoxicillin: 0, metronidazole: 0, meloxicam: 0 },
    { weight: '0.5kg', amoxicillin: 0, metronidazole: 0, meloxicam: 0 },
    { weight: '1kg', amoxicillin: 5, metronidazole: 0, meloxicam: 0.1 },
    { weight: '2kg', amoxicillin: 10, metronidazole: 0, meloxicam: 0.2 },
  ],
  fish: [],
};

export function DosageChart({ species, className = '' }: { species: SpeciesId; className?: string }) {
  const data = DOSAGE_DATA[species] || [];
  if (data.length === 0) {
    return (
      <div className={`bg-card rounded-2xl border border-border p-4 ${className}`}>
        <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-primary" />
          用药剂量参考表
        </h4>
        <p className="text-xs text-muted-foreground">该物种用药按水体积计算，请参考药品说明书。</p>
      </div>
    );
  }
  return (
    <div className={`bg-card rounded-2xl border border-border p-4 ${className}`}>
      <h4 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
        <span className="w-1.5 h-4 rounded-full bg-primary" />
        用药剂量参考表
      </h4>
      <p className="text-[11px] text-muted-foreground mb-3">
        参考值（mg/次），必须遵兽医医嘱使用
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="weight" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
          <Bar dataKey="amoxicillin" name="阿莫西林" fill="hsl(175 60% 38%)" radius={[3, 3, 0, 0]} />
          <Bar dataKey="metronidazole" name="甲硝唑" fill="hsl(35 80% 58%)" radius={[3, 3, 0, 0]} />
          <Bar dataKey="meloxicam" name="美洛昔康" fill="hsl(var(--destructive))" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-[10px] text-muted-foreground mt-2">
        ⚠️ 以上为参考剂量，不同药品浓度不同，严禁自行用药。
      </p>
    </div>
  );
}

/* ============================================================
 *  5. Emergency Decision Flowchart (SVG)
 * ============================================================ */

export function EmergencyFlowchart({
  redFlags = [],
  className = '',
}: {
  redFlags?: string[];
  className?: string;
}) {
  return (
    <div className={`bg-card rounded-2xl border border-border p-4 ${className}`}>
      <h4 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
        <span className="w-1.5 h-4 rounded-full bg-destructive" />
        就医判断流程图
      </h4>
      {redFlags.length > 0 && (
        <div className="mb-3 space-y-0.5">
          {redFlags.slice(0, 4).map((f, i) => (
            <div key={i} className="text-[10px] text-destructive flex items-start gap-1">
              <span className="mt-0.5">⚠</span>
              <span>{f}</span>
            </div>
          ))}
        </div>
      )}
      <svg viewBox="0 0 280 340" className="w-full max-w-xs mx-auto" role="img" aria-label="Emergency decision flowchart">
        <title>就医判断流程图</title>
        <desc>根据症状严重程度判断立即就医或居家观察的决策流程</desc>

        {/* Start */}
        <rect x="90" y="10" width="100" height="30" rx="15" className="diagram-fill-primary" />
        <text x="140" y="29" textAnchor="middle" className="diagram-text">观察症状</text>

        <line x1="140" y1="40" x2="140" y2="55" className="diagram-stroke" />
        <polygon points="140,60 135,55 145,55" className="diagram-fill-primary" />

        {/* Decision 1: Red flags? */}
        <polygon points="140,65 215,105 140,145 65,105" className="diagram-fill-danger" />
        <text x="140" y="100" textAnchor="middle" className="diagram-text">是否出现</text>
        <text x="140" y="115" textAnchor="middle" className="diagram-text">红色警报？</text>
        <text x="140" y="130" textAnchor="middle" className="diagram-label">出血/抽搐/呼吸困难</text>

        {/* Yes → Emergency */}
        <line x1="215" y1="105" x2="250" y2="105" className="diagram-stroke" />
        <text x="230" y="100" className="diagram-label">是</text>
        <rect x="225" y="120" width="55" height="35" rx="6" className="diagram-fill-danger" />
        <text x="252" y="135" textAnchor="middle" className="diagram-text" style={{ fill: 'hsl(var(--destructive))' }}>立即</text>
        <text x="252" y="148" textAnchor="middle" className="diagram-text" style={{ fill: 'hsl(var(--destructive))' }}>急诊</text>

        {/* No → Decision 2 */}
        <line x1="140" y1="145" x2="140" y2="160" className="diagram-stroke" />
        <text x="148" y="158" className="diagram-label">否</text>
        <polygon points="140,165 215,205 140,245 65,205" className="diagram-fill-warning" />
        <text x="140" y="200" textAnchor="middle" className="diagram-text">持续超过</text>
        <text x="140" y="215" textAnchor="middle" className="diagram-text">24小时？</text>

        {/* Yes → See vet in 24h */}
        <line x1="215" y1="205" x2="250" y2="205" className="diagram-stroke" />
        <text x="230" y="200" className="diagram-label">是</text>
        <rect x="225" y="220" width="55" height="35" rx="6" className="diagram-fill-warning" />
        <text x="252" y="235" textAnchor="middle" className="diagram-text">24h内</text>
        <text x="252" y="248" textAnchor="middle" className="diagram-text">就医</text>

        {/* No → Decision 3 */}
        <line x1="140" y1="245" x2="140" y2="260" className="diagram-stroke" />
        <text x="148" y="258" className="diagram-label">否</text>
        <polygon points="140,265 205,295 140,325 75,295" className="diagram-fill-primary" />
        <text x="140" y="295" textAnchor="middle" className="diagram-text">逐渐加重？</text>

        {/* Yes → left */}
        <line x1="75" y1="295" x2="40" y2="295" className="diagram-stroke" />
        <text x="55" y="290" className="diagram-label">是</text>
        <rect x="15" y="280" width="50" height="30" rx="6" className="diagram-fill-warning" />
        <text x="40" y="299" textAnchor="middle" className="diagram-text">尽快就医</text>

        {/* No → down */}
        <line x1="140" y1="325" x2="140" y2="335" className="diagram-stroke" />
        <text x="148" y="333" className="diagram-label">否</text>
        <rect x="100" y="338" width="80" height="0" />
        <text x="140" y="350" textAnchor="middle" className="diagram-text">✓ 居家观察</text>
      </svg>
    </div>
  );
}

/* ============================================================
 *  6. PlanDiagrams — wrapper with toggle for logged-in plans
 * ============================================================ */

export function PlanDiagrams({
  species,
  redFlags = [],
  className = '',
}: {
  species: SpeciesId;
  redFlags?: string[];
  className?: string;
}) {
  const [showDiagrams, setShowDiagrams] = useState(true);

  return (
    <div className={className}>
      <button
        onClick={() => setShowDiagrams(!showDiagrams)}
        className="w-full flex items-center justify-between bg-primary/5 border border-primary/30 rounded-2xl p-3 text-sm text-primary font-medium hover:bg-primary/10 transition-colors mb-3"
      >
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-primary" />
          {showDiagrams ? '隐藏图解（纯文本模式）' : '显示图解'}
        </span>
        <span className="text-xs">{showDiagrams ? '▲' : '▼'}</span>
      </button>

      {showDiagrams && (
        <div className="space-y-3 animate-fade-up">
          <AnatomyDiagram species={species} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <EmergencyFlowchart redFlags={redFlags} />
            <DosageChart species={species} />
          </div>
          <CareGuideSelector />
        </div>
      )}
    </div>
  );
}
