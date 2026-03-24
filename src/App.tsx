/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useCallback, useRef, KeyboardEvent, useEffect } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useDragControls } from 'motion/react';

/** Utility for tailwind classes */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { 
  Plus, 
  Trash2, 
  PieChart as PieChartIcon, 
  Wallet, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Save, 
  Download, 
  Calendar, 
  GripVertical,
  Home,
  Car,
  Zap,
  Wifi,
  Smartphone,
  CreditCard,
  ShoppingBag,
  Coffee,
  Utensils,
  Heart,
  Activity,
  Shield,
  GraduationCap,
  Plane,
  Gift,
  Music,
  Film,
  Gamepad,
  Dumbbell,
  Briefcase,
  DollarSign,
  PiggyBank,
  ChevronDown,
  LayoutDashboard,
  List as ListIcon,
  BarChart3,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Type,
  Palette,
  Check,
  Cigarette,
  Bus
} from 'lucide-react';
import { Reorder } from 'motion/react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

interface BudgetItem {
  id: string;
  label: string;
  amount: number;
  actualAmount?: number;
  category: 'income' | 'fixed' | 'variable' | 'savings';
  icon?: string;
}

const ICON_MAP: Record<string, any> = {
  Home, Car, Zap, Wifi, Smartphone, CreditCard, ShoppingBag, Coffee, Utensils, 
  Heart, Activity, Shield, GraduationCap, Plane, Gift, Music, Film, Gamepad, 
  Dumbbell, Briefcase, DollarSign, PiggyBank, Wallet, Cigarette, Bus
};

const INITIAL_ITEMS: BudgetItem[] = [
  // Income
  { id: '1', label: 'Salaire net', amount: 3227.53, category: 'income', icon: 'Briefcase' },
  { id: '2', label: 'CAF', amount: 75.53, category: 'income', icon: 'DollarSign' },
  { id: '3', label: 'Découvert + ou - restant', amount: 0, category: 'income', icon: 'Wallet' },
  
  // Savings
  { id: '4', label: 'Épargne', amount: 1000.28, category: 'savings', icon: 'PiggyBank' },
  
  // Fixed Expenses
  { id: '5', label: 'Crédit travaux fenêtre', amount: 156.70, category: 'fixed', icon: 'Home' },
  { id: '6', label: 'Paiement factures EDF-GDF', amount: 210.00, category: 'fixed', icon: 'Zap' },
  { id: '7', label: 'Assurance voiture', amount: 71.28, category: 'fixed', icon: 'Shield' },
  { id: '8', label: 'Assurance habitation', amount: 29.98, category: 'fixed', icon: 'Shield' },
  { id: '9', label: 'Basic Fit', amount: 14.99, category: 'fixed', icon: 'Dumbbell' },
  { id: '10', label: 'Crédit immo', amount: 664.37, category: 'fixed', icon: 'Home' },
  { id: '11', label: 'Assurance crédit immo', amount: 9.49, category: 'fixed', icon: 'Shield' },
  { id: '12', label: 'Charge copro', amount: 110.00, category: 'fixed', icon: 'Home' },
  { id: '13', label: 'Free internet netflix disney amazon', amount: 60.48, category: 'fixed', icon: 'Wifi' },
  { id: '14', label: 'Free portable', amount: 31.98, category: 'fixed', icon: 'Smartphone' },
  { id: '15', label: 'Frais CB+ass prévoyance', amount: 26.35, category: 'fixed', icon: 'CreditCard' },
  { id: '16', label: 'Abonnement TCL Laetitia', amount: 74.10, category: 'fixed', icon: 'Bus' },
  { id: '17', label: 'Abonnement TCL Fabien', amount: 25.00, category: 'fixed', icon: 'Bus' },
  { id: '18', label: 'Impôt foncier', amount: 101.00, category: 'fixed', icon: 'Home' },
  
  // Variable Expenses
  { id: '19', label: 'Argent poche', amount: 40.00, actualAmount: 0, category: 'variable', icon: 'DollarSign' },
  { id: '20', label: 'Courses', amount: 74.49, actualAmount: 0, category: 'variable', icon: 'ShoppingBag' },
  { id: '21', label: 'Essence', amount: 0, actualAmount: 0, category: 'variable', icon: 'Car' },
  { id: '22', label: 'Divers resto/vêtements', amount: 280.29, actualAmount: 0, category: 'variable', icon: 'Utensils' },
  { id: '23', label: 'Cigarette', amount: 250.00, actualAmount: 0, category: 'variable', icon: 'Cigarette' },
];

interface Settings {
  darkMode: boolean;
  fontFamily: string;
  primaryColor: string;
  categoryColors: Record<BudgetItem['category'], string>;
  defaultChartType: 'bar' | 'pie';
  distributionView: 'list' | 'pie';
}

const CATEGORY_COLORS: Record<BudgetItem['category'], string> = {
  income: '#10b981', // Emerald 500
  fixed: '#f59e0b', // Amber 500
  variable: '#3b82f6', // Blue 500
  savings: '#8b5cf6', // Violet 500
};

interface BudgetItemRowProps {
  key?: string | number;
  item: BudgetItem;
  settings: any;
  onUpdateLabel: (id: string, label: string) => void;
  onUpdateAmount: (id: string, amount: number) => void;
  onUpdateActualAmount?: (id: string, amount: number) => void;
  onUpdateCategory: (id: string, category: BudgetItem['category']) => void;
  onUpdateIcon: (id: string, icon: string) => void;
  onRemove: (id: string) => void;
}

const ICON_LABELS: Record<string, string> = {
  Home: 'Habitation',
  Car: 'Transport / Essence',
  Zap: 'Énergie / Électricité',
  Wifi: 'Internet / Box',
  Smartphone: 'Téléphonie',
  CreditCard: 'Frais Bancaires',
  ShoppingBag: 'Courses / Achats',
  Coffee: 'Loisirs / Café',
  Utensils: 'Restauration',
  Heart: 'Santé',
  Activity: 'Transports en commun',
  Shield: 'Assurances',
  GraduationCap: 'Éducation',
  Plane: 'Voyage',
  Gift: 'Cadeaux',
  Music: 'Musique',
  Film: 'Cinéma / Vidéo',
  Gamepad: 'Jeux Vidéo',
  Dumbbell: 'Sport / Bien-être',
  Briefcase: 'Travail / Revenus',
  DollarSign: 'Divers / Argent',
  PiggyBank: 'Épargne',
  Wallet: 'Portefeuille',
  Cigarette: 'Tabac / Cigarette',
  Bus: 'Transports en commun'
};

/** Component for the distribution table by icon */
function DistributionByIcon({ items, settings }: { items: BudgetItem[], settings: any }) {
  const expenseItems = items.filter(i => i.category === 'fixed' || i.category === 'variable');
  
  const distribution = useMemo(() => {
    const stats: Record<string, number> = {};
    expenseItems.forEach(item => {
      const icon = item.icon || 'CreditCard';
      stats[icon] = (stats[icon] || 0) + item.amount;
    });
    
    return Object.entries(stats)
      .map(([icon, amount]) => ({
        icon,
        label: ICON_LABELS[icon] || icon,
        amount
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenseItems]);

  const totalExpenses = distribution.reduce((acc, curr) => acc + curr.amount, 0);

  if (distribution.length === 0) return null;

  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, outerRadius, icon } = props;
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 25;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const IconComp = ICON_MAP[icon] || CreditCard;

    return (
      <g>
        <foreignObject x={x - 10} y={y - 10} width={20} height={20}>
          <div className={cn("flex items-center justify-center w-5 h-5 rounded-full shadow-sm border", settings.darkMode ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-white border-slate-200 text-slate-600")}>
            <IconComp className="w-3 h-3" />
          </div>
        </foreignObject>
      </g>
    );
  };

  const COLORS = [
    settings.primaryColor,
    '#3b82f6', // blue-500
    '#f59e0b', // amber-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#06b6d4', // cyan-500
    '#f43f5e', // rose-500
    '#10b981', // emerald-500
  ];

  return (
    <div className={cn("rounded-2xl shadow-sm border overflow-hidden", settings.darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
      <div className={cn("px-6 py-4 border-b flex items-center gap-3", settings.darkMode ? "bg-slate-800/50 border-slate-800" : "bg-slate-50/50 border-slate-100")}>
        <div className={cn("p-2 rounded-lg", settings.darkMode ? "bg-slate-800" : "bg-slate-200")}>
          <PieChartIcon className={cn("w-5 h-5", settings.darkMode ? "text-slate-400" : "text-slate-600")} />
        </div>
        <h2 className={cn("font-semibold tracking-tight", settings.darkMode ? "text-slate-100" : "text-slate-800")}>Répartition par type</h2>
      </div>
      
      <div className="p-6">
        {settings.distributionView === 'pie' ? (
          <div className="h-72 w-full flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Pie
                  data={distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="amount"
                  label={renderCustomizedLabel}
                  labelLine={false}
                >
                  {distribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: number, name: string, props: any) => {
                    const percentage = totalExpenses > 0 ? (val / totalExpenses) * 100 : 0;
                    return [`${formatCurrency(val)} (${percentage.toFixed(1)}%)`, props.payload.label];
                  }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    backgroundColor: settings.darkMode ? '#0f172a' : '#fff',
                    color: settings.darkMode ? '#fff' : '#000'
                  }}
                  itemStyle={{ color: settings.darkMode ? '#fff' : '#000' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
              {distribution.slice(0, 5).map((item, index) => (
                <div key={item.icon} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {distribution.map(({ icon, label, amount }) => {
              const IconComp = ICON_MAP[icon] || CreditCard;
              const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
              
              return (
                <div key={icon} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-1.5 rounded-md transition-colors", settings.darkMode ? "bg-slate-800 text-slate-500 group-hover:bg-slate-700" : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600")}>
                        <IconComp className="w-3.5 h-3.5" />
                      </div>
                      <span className={cn("text-sm font-medium", settings.darkMode ? "text-slate-400" : "text-slate-600")}>{label}</span>
                    </div>
                    <div className="text-right">
                      <span className={cn("text-sm font-bold block", settings.darkMode ? "text-slate-100" : "text-slate-800")}>
                        {formatCurrency(amount)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className={cn("h-1.5 rounded-full overflow-hidden", settings.darkMode ? "bg-slate-800" : "bg-slate-100")}>
                    <div 
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${percentage}%`, backgroundColor: settings.primaryColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className={cn("px-6 py-3 border-t flex justify-between items-center", settings.darkMode ? "bg-slate-800/50 border-slate-800" : "bg-slate-50 border-slate-100")}>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Dépenses</span>
        <span className={cn("text-sm font-black", settings.darkMode ? "text-slate-100" : "text-slate-800")}>
          {formatCurrency(totalExpenses)}
        </span>
      </div>
    </div>
  );
}
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val);
};

/** Component for a single budget item row with local state handling */
function BudgetItemRow({ 
  item, 
  settings,
  onUpdateLabel, 
  onUpdateAmount, 
  onUpdateActualAmount,
  onUpdateCategory,
  onUpdateIcon,
  onRemove 
}: BudgetItemRowProps) {
  const [localLabel, setLocalLabel] = useState(item.label);
  const [localAmount, setLocalAmount] = useState(item.amount.toString());
  const [localActualAmount, setLocalActualAmount] = useState(
    item.category === 'variable' ? "" : (item.actualAmount ?? 0).toString()
  );
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // Sync local state if item changes from outside (e.g. reset)
  useEffect(() => {
    setLocalLabel(item.label);
    setLocalAmount(item.amount.toString());
    if (item.category !== 'variable') {
      setLocalActualAmount((item.actualAmount ?? 0).toString());
    } else {
      setLocalActualAmount("");
    }
  }, [item.label, item.amount, item.actualAmount, item.category]);

  const handleLabelBlur = () => {
    onUpdateLabel(item.id, localLabel);
  };

  const evaluateExpression = (expr: string): number => {
    try {
      // Basic math evaluation for +, -, *, /
      // Replace comma with dot for calculation
      const cleanExpr = expr.replace(/,/g, '.').replace(/[^-+*/0-9.]/g, '');
      if (!cleanExpr) return 0;
      
      // Use Function constructor for simple math evaluation (safer than eval)
      // We've already sanitized the input to only allow math chars and numbers
      const result = new Function(`return ${cleanExpr}`)();
      return typeof result === 'number' && isFinite(result) ? result : 0;
    } catch (e) {
      return 0;
    }
  };

  const handleAmountBlur = () => {
    const val = evaluateExpression(localAmount);
    onUpdateAmount(item.id, val);
    setLocalAmount(val.toString());
  };

  const handleActualAmountBlur = () => {
    if (onUpdateActualAmount) {
      const val = evaluateExpression(localActualAmount);
      if (isVariable) {
        // For variables, blur also adds if not empty, then clears
        if (localActualAmount.trim() !== "") {
          const currentVal = item.actualAmount ?? 0;
          onUpdateActualAmount(item.id, currentVal + val);
        }
        setLocalActualAmount("");
      } else {
        onUpdateActualAmount(item.id, val);
        setLocalActualAmount(val.toString());
      }
    }
  };

  const handleVariableAdd = () => {
    if (onUpdateActualAmount) {
      const valToAdd = evaluateExpression(localActualAmount);
      const currentVal = item.actualAmount ?? 0;
      onUpdateActualAmount(item.id, currentVal + valToAdd);
      setLocalActualAmount("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, isActualField: boolean = false) => {
    if (e.key === 'Enter') {
      if (isVariable && isActualField) {
        handleVariableAdd();
      }
      (e.target as HTMLInputElement).blur();
    }
  };

  const resetActual = () => {
    setLocalActualAmount('0');
    if (onUpdateActualAmount) onUpdateActualAmount(item.id, 0);
  };

  const isVariable = item.category === 'variable';
  const consumptionPercent = item.amount > 0 ? Math.min(100, ((item.actualAmount ?? 0) / item.amount) * 100) : 0;
  const isOverBudget = (item.actualAmount ?? 0) > item.amount && item.amount > 0;

  const ItemIcon = ICON_MAP[item.icon || 'CreditCard'] || CreditCard;
  const dragControls = useDragControls();

  const categories: { id: BudgetItem['category'], label: string }[] = [
    { id: 'income', label: 'Revenus' },
    { id: 'fixed', label: 'Fixes' },
    { id: 'variable', label: 'Variables' },
    { id: 'savings', label: 'Épargne' }
  ];

  return (
    <Reorder.Item 
      value={item} 
      id={item.id}
      dragListener={false}
      dragControls={dragControls}
      className={cn(
        "group transition-colors relative",
        settings.darkMode ? "bg-slate-900 hover:bg-slate-800/50" : "bg-white hover:bg-slate-50"
      )}
    >
      <div className="px-2 py-0.5 flex items-center gap-1.5">
        <div 
          onPointerDown={(e) => dragControls.start(e)}
          className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-400 -ml-1 p-1 touch-none"
        >
          <GripVertical className="w-3 h-3" />
        </div>
        
        {/* Icon Picker */}
        <div className="relative">
          <button 
            onClick={() => setShowIconPicker(!showIconPicker)}
            className={cn(
              "p-1 rounded-lg transition-colors",
              settings.darkMode ? "bg-slate-800 text-slate-400 hover:bg-slate-700" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            )}
          >
            <ItemIcon className="w-3 h-3" />
          </button>
          {showIconPicker && (
        <div className={cn(
          "absolute top-full left-0 mt-2 p-2 border rounded-xl shadow-2xl z-[100] grid grid-cols-5 gap-1 w-48 max-h-60 overflow-y-auto scrollbar-hide",
          settings.darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
        )}>
              {Object.keys(ICON_MAP).map(iconName => {
                const IconComp = ICON_MAP[iconName];
                return (
                  <button
                    key={iconName}
                    onClick={() => {
                      onUpdateIcon(item.id, iconName);
                      setShowIconPicker(false);
                    }}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      item.icon === iconName 
                        ? (settings.darkMode ? "bg-slate-800 text-emerald-500" : "bg-slate-100 text-blue-600") 
                        : (settings.darkMode ? "text-slate-500 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100")
                    )}
                  >
                    <IconComp className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <input
            type="text"
            value={localLabel}
            onChange={(e) => setLocalLabel(e.target.value)}
            onBlur={handleLabelBlur}
            onKeyDown={(e) => handleKeyDown(e)}
            className={cn(
              "bg-transparent border-none focus:ring-0 text-sm font-medium focus:px-2 rounded transition-all w-full",
              settings.darkMode ? "text-slate-200 focus:bg-slate-800" : "text-slate-700 focus:bg-white"
            )}
          />
          
          {/* Category Selector */}
          <div className="relative">
            <button 
              onClick={() => setShowCategoryPicker(!showCategoryPicker)}
              className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 hover:text-slate-600 transition-colors px-1"
            >
              {categories.find(c => c.id === item.category)?.label}
              <ChevronDown className="w-2 h-2" />
            </button>
            {showCategoryPicker && (
              <div className={cn(
                "absolute top-full left-0 mt-1 p-1 border rounded-lg shadow-lg z-50 flex flex-col w-32",
                settings.darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
              )}>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onUpdateCategory(item.id, cat.id);
                      setShowCategoryPicker(false);
                    }}
                    className={cn(
                      "px-3 py-1.5 text-left text-[10px] uppercase font-bold tracking-wider rounded transition-colors",
                      item.category === cat.id 
                        ? (settings.darkMode ? "bg-slate-800 text-emerald-500" : "bg-slate-100 text-blue-600") 
                        : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className="flex flex-col items-end">
            <span className="text-[8px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Budget</span>
            <input
              type="text"
              inputMode="decimal"
              value={localAmount}
              onChange={(e) => setLocalAmount(e.target.value)}
              onBlur={handleAmountBlur}
              onKeyDown={(e) => handleKeyDown(e)}
              className={cn(
                "w-16 text-right border-none rounded-lg px-1.5 py-0.5 text-[11px] font-mono focus:ring-2 transition-all",
                settings.darkMode ? "bg-slate-800 text-slate-200 focus:ring-slate-700 focus:bg-slate-700" : "bg-slate-100 text-slate-900 focus:ring-slate-200 focus:bg-white"
              )}
              placeholder="0.00"
            />
          </div>
          <button 
            onClick={() => onRemove(item.id)}
            className="p-0.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all mt-2.5"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {isVariable && (
        <div className="px-4 sm:px-5 pb-3 pt-0 -mt-1 ml-8 sm:ml-12 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 w-full">
              <div className="flex flex-col flex-1">
                <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 mb-1">
                  <span>Consommation</span>
                  <span className={cn(isOverBudget ? "text-rose-500" : "text-slate-500")}>
                    {Math.round(consumptionPercent)}%
                  </span>
                </div>
                <div className={cn("h-1.5 rounded-full overflow-hidden", settings.darkMode ? "bg-slate-800" : "bg-slate-100")}>
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      isOverBudget ? "bg-rose-500" : ""
                    )}
                    style={{ 
                      width: `${consumptionPercent}%`, 
                      backgroundColor: !isOverBudget ? settings.primaryColor : undefined 
                    }}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">
                  Total: {formatCurrency(item.actualAmount ?? 0)}
                </span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={localActualAmount}
                    onChange={(e) => setLocalActualAmount(e.target.value)}
                    onBlur={handleActualAmountBlur}
                    onKeyDown={(e) => handleKeyDown(e, true)}
                    className={cn(
                      "w-20 sm:w-24 text-right border-none rounded-lg px-3 py-1.5 text-sm font-mono focus:ring-2 transition-all",
                      isOverBudget 
                        ? (settings.darkMode ? "bg-rose-900/30 text-rose-400 focus:ring-rose-900/50" : "bg-rose-50 text-rose-700 focus:ring-rose-200") 
                        : (settings.darkMode ? "bg-slate-800 text-slate-200 focus:ring-slate-700" : "bg-blue-50 text-blue-700 focus:ring-blue-200")
                    )}
                    placeholder="Ajouter..."
                  />
                  <button 
                    onClick={handleVariableAdd}
                    title="Ajouter au montant actuel"
                    className={cn(
                      "flex items-center justify-center w-9 h-9 rounded-lg font-bold text-[10px] transition-all shrink-0",
                      settings.darkMode ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    )}
                  >
                    OK
                  </button>
                  <button 
                    onClick={resetActual}
                    title="Remise à zéro"
                    className="p-1.5 text-slate-300 hover:text-slate-600 transition-colors shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 rotate-45" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          {isOverBudget && (
            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tight">
              Dépassement de {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format((item.actualAmount ?? 0) - item.amount)}
            </p>
          )}
        </div>
      )}
    </Reorder.Item>
  );
}

export default function App() {
  const [items, setItems] = useState<BudgetItem[]>(() => {
    const saved = localStorage.getItem('budget_items');
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const saved = localStorage.getItem('budget_month_year');
    return saved || new Date().toISOString().slice(0, 7);
  });
  const [activeTab, setActiveTab] = useState<'home' | 'expenses' | 'stats' | 'settings'>('home');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('budget_settings');
    const defaultSettings: Settings = {
      darkMode: false,
      fontFamily: 'sans',
      primaryColor: '#10b981', // emerald-500
      categoryColors: CATEGORY_COLORS,
      defaultChartType: 'bar',
      distributionView: 'list',
    };
    if (!saved) return defaultSettings;
    const parsed = JSON.parse(saved);
    // Handle legacy 'area' chart type
    if (parsed.defaultChartType === 'area') parsed.defaultChartType = 'pie';
    return { ...defaultSettings, ...parsed };
  });

  // Save to localStorage whenever items, month/year or settings change
  useEffect(() => {
    localStorage.setItem('budget_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('budget_month_year', selectedMonth);
  }, [selectedMonth]);

  useEffect(() => {
    localStorage.setItem('budget_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const historicalData = useMemo(() => ({
    daily: [
      { day: 'Lun', amount: 45 }, { day: 'Mar', amount: 52 }, { day: 'Mer', amount: 38 },
      { day: 'Jeu', amount: 65 }, { day: 'Ven', amount: 48 }, { day: 'Sam', amount: 120 },
      { day: 'Dim', amount: 85 }
    ],
    monthly: [
      { month: 'Jan', amount: 1850 }, { month: 'Fév', amount: 1720 }, { month: 'Mar', amount: 1950 },
      { month: 'Avr', amount: 1680 }, { month: 'Mai', amount: 1820 }, { month: 'Juin', amount: 1750 }
    ],
    yearly: [
      { year: '2021', amount: 21500 }, { year: '2022', amount: 22800 }, { year: '2023', amount: 24200 },
      { year: '2024', amount: 23500 }, { year: '2025', amount: 25100 }
    ]
  }), []);

  const currentCategoryColors = useMemo(() => settings.categoryColors || CATEGORY_COLORS, [settings.categoryColors]);

  const formatMonthYear = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(date);
  };

  const totals = useMemo(() => {
    const income = items.filter(i => i.category === 'income').reduce((acc, i) => acc + i.amount, 0);
    const fixed = items.filter(i => i.category === 'fixed').reduce((acc, i) => acc + i.amount, 0);
    const variable = items.filter(i => i.category === 'variable').reduce((acc, i) => acc + i.amount, 0);
    const savings = items.filter(i => i.category === 'savings').reduce((acc, i) => acc + i.amount, 0);
    
    const totalExpenses = fixed + variable;
    const remaining = income - totalExpenses;
    
    return { income, fixed, variable, savings, totalExpenses, remaining };
  }, [items]);

  const chartData = useMemo(() => [
    { name: 'Fixes', value: totals.fixed, color: currentCategoryColors.fixed },
    { name: 'Variables', value: totals.variable, color: currentCategoryColors.variable },
    { name: 'Restant', value: Math.max(0, totals.remaining), color: '#94a3b8' },
  ].filter(d => d.value > 0), [totals, currentCategoryColors]);

  const updateAmount = (id: string, amount: number) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, amount } : item));
  };

  const updateActualAmount = (id: string, actualAmount: number) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, actualAmount } : item));
  };

  const updateCategory = (id: string, category: BudgetItem['category']) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, category } : item));
  };

  const updateIcon = (id: string, icon: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, icon } : item));
  };

  const addItem = (category: BudgetItem['category']) => {
    const newItem: BudgetItem = {
      id: Math.random().toString(36).substr(2, 9),
      label: 'Nouvel élément',
      amount: 0,
      actualAmount: category === 'variable' ? 0 : undefined,
      category,
      icon: 'CreditCard'
    };
    setItems(prev => [...prev, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateLabel = (id: string, label: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, label } : item));
  };

  const handleReorder = (newOrder: BudgetItem[], category: BudgetItem['category']) => {
    const otherItems = items.filter(i => i.category !== category);
    // Find the original index of the first item of this category to maintain relative section position
    const firstIndex = items.findIndex(i => i.category === category);
    
    const newItems = [...items];
    // This is a bit complex because we want to replace only the items of this category in their original relative positions
    // A simpler way:
    const result = [...otherItems];
    result.splice(firstIndex === -1 ? result.length : firstIndex, 0, ...newOrder);
    setItems(result);
  };

  const Section = ({ title, category, icon: Icon, colorClass, customColor }: { 
    title: string, 
    category: BudgetItem['category'], 
    icon: any,
    colorClass: string,
    customColor?: string
  }) => {
    const filteredItems = items.filter(i => i.category === category);
    const sectionTotal = filteredItems.reduce((acc, i) => acc + i.amount, 0);

    return (
      <div className={cn("rounded-2xl shadow-sm border", settings.darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
        <div 
          className={cn("px-4 py-2 flex items-center justify-between border-b rounded-t-2xl", colorClass, settings.darkMode ? "border-slate-800" : "border-slate-100")}
          style={{ backgroundColor: !settings.darkMode && customColor ? customColor : undefined }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1 bg-white/20 rounded-lg shrink-0">
              <Icon className="w-3.5 h-3.5 text-white" />
            </div>
            <h2 className="font-bold text-white tracking-tight text-sm truncate">{title}</h2>
          </div>
          <span className="text-white font-black text-sm">{formatCurrency(sectionTotal)}</span>
        </div>
        <Reorder.Group 
          axis="y" 
          values={filteredItems} 
          onReorder={(newOrder) => handleReorder(newOrder, category)}
          className={cn("divide-y", settings.darkMode ? "divide-slate-800" : "divide-slate-100")}
        >
          {filteredItems.map((item) => (
            <BudgetItemRow 
              key={item.id} 
              item={item} 
              settings={settings}
              onUpdateLabel={updateLabel} 
              onUpdateAmount={updateAmount} 
              onUpdateActualAmount={updateActualAmount}
              onUpdateCategory={updateCategory}
              onUpdateIcon={updateIcon}
              onRemove={removeItem} 
            />
          ))}
        </Reorder.Group>
        <div className={cn("border-t", settings.darkMode ? "border-slate-800 bg-slate-900/50" : "border-slate-50 bg-slate-50/30")}>
          <button 
            onClick={() => addItem(category)}
            className={cn(
              "w-full px-4 py-2 flex items-center gap-2 transition-all text-[10px] font-bold uppercase tracking-wider",
              settings.darkMode ? "text-slate-500 hover:text-slate-300 hover:bg-slate-800" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            )}
          >
            <Plus className="w-2.5 h-2.5" />
            Ajouter un élément
          </button>
        </div>
      </div>
    );
  };

  const StatsView = () => {
    const [period, setPeriod] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
    const [chartType, setChartType] = useState<'bar' | 'pie'>(settings.defaultChartType);
    const [pieType, setPieType] = useState<'pie' | 'donut'>('pie');
    const data = historicalData[period];

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Statistiques</h2>
          <div className="flex items-center gap-2">
            <div className={cn("flex p-1 rounded-xl", settings.darkMode ? "bg-slate-800" : "bg-slate-200/50")}>
              {(['daily', 'monthly', 'yearly'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                    period === p 
                      ? (settings.darkMode ? "bg-slate-700 text-white shadow-sm" : "bg-white shadow-sm text-slate-900") 
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {p === 'daily' ? 'Jour' : p === 'monthly' ? 'Mois' : 'Année'}
                </button>
              ))}
            </div>
            <div className={cn("flex p-1 rounded-xl", settings.darkMode ? "bg-slate-800" : "bg-slate-200/50")}>
              {(['bar', 'pie'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setChartType(t)}
                  className={cn(
                    "p-1.5 rounded-lg transition-all",
                    chartType === t 
                      ? (settings.darkMode ? "bg-slate-700 text-white shadow-sm" : "bg-white shadow-sm text-slate-900") 
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {t === 'bar' ? <BarChart3 className="w-3.5 h-3.5" /> : <PieChartIcon className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={cn("rounded-3xl p-6 shadow-sm border", settings.darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg">Évolution des dépenses</h3>
            {chartType === 'pie' && (
              <div className={cn("flex p-1 rounded-xl", settings.darkMode ? "bg-slate-800" : "bg-slate-100")}>
                <button 
                  onClick={() => setPieType('pie')}
                  className={cn("px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all", pieType === 'pie' ? "bg-white shadow-sm text-slate-900" : "text-slate-500")}
                >
                  Plein
                </button>
                <button 
                  onClick={() => setPieType('donut')}
                  className={cn("px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all", pieType === 'donut' ? "bg-white shadow-sm text-slate-900" : "text-slate-500")}
                >
                  Donut
                </button>
              </div>
            )}
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={settings.darkMode ? "#1e293b" : "#f1f5f9"} />
                  <XAxis 
                    dataKey={period === 'daily' ? 'day' : period === 'monthly' ? 'month' : 'year'} 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
                    tickFormatter={(val) => `${val}€`}
                  />
                  <Tooltip 
                    cursor={{ fill: settings.darkMode ? '#1e293b' : '#f8fafc' }}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      backgroundColor: settings.darkMode ? '#0f172a' : '#fff',
                      color: settings.darkMode ? '#fff' : '#000'
                    }}
                    itemStyle={{ color: settings.darkMode ? '#fff' : '#000' }}
                    formatter={(val: number) => {
                      const total = data.reduce((acc, d) => acc + d.amount, 0);
                      const percentage = total > 0 ? (val / total) * 100 : 0;
                      return [`${formatCurrency(val)} (${percentage.toFixed(1)}%)`, 'Dépenses'];
                    }}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill={settings.primaryColor} 
                    radius={[6, 6, 0, 0]} 
                    barSize={period === 'daily' ? 30 : 40}
                  />
                </BarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={pieType === 'donut' ? 60 : 0}
                    outerRadius={80}
                    paddingAngle={pieType === 'donut' ? 5 : 0}
                    dataKey="amount"
                    nameKey={period === 'daily' ? 'day' : period === 'monthly' ? 'month' : 'year'}
                  >
                    {data.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? settings.primaryColor : `${settings.primaryColor}88`} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: number) => {
                      const total = data.reduce((acc, d) => acc + d.amount, 0);
                      const percentage = total > 0 ? (val / total) * 100 : 0;
                      return [`${formatCurrency(val)} (${percentage.toFixed(1)}%)`, 'Dépenses'];
                    }}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      backgroundColor: settings.darkMode ? '#0f172a' : '#fff',
                      color: settings.darkMode ? '#fff' : '#000'
                    }}
                    itemStyle={{ color: settings.darkMode ? '#fff' : '#000' }}
                  />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <div className={cn("rounded-2xl p-6 border", settings.darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
          <h3 className="font-bold mb-4">Analyse de la période</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className={cn("p-4 rounded-xl", settings.darkMode ? "bg-slate-800" : "bg-slate-50")}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Moyenne</p>
              <p className="text-xl font-bold">
                {formatCurrency(data.reduce((acc, d) => acc + d.amount, 0) / data.length)}
              </p>
            </div>
            <div className={cn("p-4 rounded-xl", settings.darkMode ? "bg-slate-800" : "bg-slate-50")}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Pic</p>
              <p className="text-xl font-bold">
                {formatCurrency(Math.max(...data.map(d => d.amount)))}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SettingsView = () => {
    const fonts = [
      { id: 'sans', name: 'Sans (Inter)' },
      { id: 'serif', name: 'Serif (Playfair)' },
      { id: 'mono', name: 'Mono (JetBrains)' },
      { id: 'outfit', name: 'Outfit (Modern)' },
      { id: 'space', name: 'Space (Tech)' },
      { id: 'libre', name: 'Libre (Classic)' },
      { id: 'montserrat', name: 'Montserrat (Bold)' },
      { id: 'raleway', name: 'Raleway (Elegant)' },
      { id: 'lora', name: 'Lora (Serif)' },
      { id: 'fira', name: 'Fira (Code)' },
      { id: 'quicksand', name: 'Quicksand (Rounded)' },
    ];

    const colors = [
      '#10b981', // emerald
      '#3b82f6', // blue
      '#8b5cf6', // violet
      '#f59e0b', // amber
      '#ef4444', // red
      '#ec4899', // pink
      '#06b6d4', // cyan
      '#f97316', // orange
      '#0f172a'  // slate-900
    ];

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-2xl font-bold tracking-tight">Options</h2>

        <div className="space-y-6">
          {/* Dark Mode */}
          <div className={cn("rounded-2xl p-6 shadow-sm border flex items-center justify-between", settings.darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
            <div className="flex items-center gap-4">
              <div className={cn("p-3 rounded-xl", settings.darkMode ? "bg-slate-800" : "bg-slate-100")}>
                {settings.darkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
              </div>
              <div>
                <h3 className="font-bold">Mode Sombre</h3>
                <p className="text-xs text-slate-400">Activer l'interface sombre</p>
              </div>
            </div>
            <button
              onClick={() => setSettings({ ...settings, darkMode: !settings.darkMode })}
              className={cn(
                "w-12 h-6 rounded-full transition-all relative",
                settings.darkMode ? "bg-emerald-500" : "bg-slate-600"
              )}
            >
              <div className={cn(
                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                settings.darkMode ? "left-7" : "left-1"
              )} />
            </button>
          </div>

          {/* Distribution View Type */}
          <div className={cn("rounded-2xl p-6 shadow-sm border space-y-4", settings.darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
            <div className="flex items-center gap-4">
              <div className={cn("p-3 rounded-xl", settings.darkMode ? "bg-emerald-500/10" : "bg-emerald-50")}>
                <PieChartIcon className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-bold">Affichage de la Répartition</h3>
                <p className="text-xs text-slate-400">Style de la vue par icônes</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(['list', 'pie'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setSettings({ ...settings, distributionView: v })}
                  className={cn(
                    "flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all",
                    settings.distributionView === v 
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-500" 
                      : (settings.darkMode ? "border-slate-800 hover:border-slate-700" : "border-slate-100 hover:border-slate-200")
                  )}
                >
                  {v === 'list' ? <ListIcon className="w-4 h-4" /> : <PieChartIcon className="w-4 h-4" />}
                  <span className="text-sm font-medium capitalize">{v === 'list' ? 'Liste' : 'Camembert'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Default Chart Type */}
          <div className={cn("rounded-2xl p-6 shadow-sm border space-y-4", settings.darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
            <div className="flex items-center gap-4">
              <div className={cn("p-3 rounded-xl", settings.darkMode ? "bg-blue-500/10" : "bg-blue-50")}>
                <BarChart3 className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-bold">Style de Graphique</h3>
                <p className="text-xs text-slate-400">Type de visualisation par défaut</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(['bar', 'pie'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setSettings({ ...settings, defaultChartType: t })}
                  className={cn(
                    "flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all",
                    settings.defaultChartType === t 
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-500" 
                      : (settings.darkMode ? "border-slate-800 hover:border-slate-700" : "border-slate-100 hover:border-slate-200")
                  )}
                >
                  {t === 'bar' ? <BarChart3 className="w-4 h-4" /> : <PieChartIcon className="w-4 h-4" />}
                  <span className="text-sm font-medium capitalize">{t === 'bar' ? 'Barres' : 'Circulaire'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Font Selection */}
          <div className={cn("rounded-2xl p-6 shadow-sm border space-y-4", settings.darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
            <div className="flex items-center gap-4">
              <div className={cn("p-3 rounded-xl", settings.darkMode ? "bg-violet-500/10" : "bg-violet-50")}>
                <Type className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <h3 className="font-bold">Police d'écriture</h3>
                <p className="text-xs text-slate-400">Changer le style du texte</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {fonts.map(f => (
                <button
                  key={f.id}
                  onClick={() => setSettings({ ...settings, fontFamily: f.id })}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl border transition-all",
                    settings.fontFamily === f.id 
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-500" 
                      : (settings.darkMode ? "border-slate-800 hover:border-slate-700" : "border-slate-100 hover:border-slate-200")
                  )}
                >
                  <span className={cn(
                    "text-sm font-medium", 
                    f.id === 'serif' ? 'font-serif' : 
                    f.id === 'mono' ? 'font-mono' : 
                    f.id === 'outfit' ? 'font-outfit' : 
                    f.id === 'space' ? 'font-space' : 
                    f.id === 'libre' ? 'font-libre' : 
                    f.id === 'montserrat' ? 'font-montserrat' :
                    f.id === 'raleway' ? 'font-raleway' :
                    f.id === 'lora' ? 'font-lora' :
                    f.id === 'fira' ? 'font-fira' :
                    f.id === 'quicksand' ? 'font-quicksand' : 'font-sans'
                  )}>
                    {f.name}
                  </span>
                  {settings.fontFamily === f.id && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Category Colors */}
          <div className={cn("rounded-2xl p-6 shadow-sm border space-y-4", settings.darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
            <div className="flex items-center gap-4">
              <div className={cn("p-3 rounded-xl", settings.darkMode ? "bg-emerald-500/10" : "bg-emerald-50")}>
                <Palette className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-bold">Couleurs des Catégories</h3>
                <p className="text-xs text-slate-400">Personnaliser les couleurs par type</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(CATEGORY_COLORS).map(([cat, defaultColor]) => {
                const CatIcon = cat === 'income' ? ArrowUpCircle : cat === 'fixed' ? Home : cat === 'variable' ? ShoppingBag : PiggyBank;
                const currentColor = settings.categoryColors?.[cat] || CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS];
                return (
                  <div key={cat} className="flex items-center justify-between p-3 rounded-xl bg-slate-100/50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${currentColor}20` }}>
                        <CatIcon className="w-3.5 h-3.5" style={{ color: currentColor }} />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {cat === 'income' ? 'Revenus' : cat === 'fixed' ? 'Fixes' : cat === 'variable' ? 'Variables' : 'Épargne'}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      {['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899'].map(c => (
                        <button
                          key={c}
                          onClick={() => {
                            setSettings({
                              ...settings,
                              categoryColors: {
                                ...(settings.categoryColors || CATEGORY_COLORS),
                                [cat]: c
                              }
                            });
                          }}
                          className={cn(
                            "w-5 h-5 rounded-full transition-all",
                            (settings.categoryColors?.[cat] || CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS]) === c 
                              ? "ring-2 ring-slate-900 dark:ring-white scale-110" 
                              : "opacity-40 hover:opacity-100"
                          )}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Color Palette */}
          <div className={cn("rounded-2xl p-6 shadow-sm border space-y-4", settings.darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
            <div className="flex items-center gap-4">
              <div className={cn("p-3 rounded-xl", settings.darkMode ? "bg-amber-500/10" : "bg-amber-50")}>
                <Palette className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="font-bold">Couleur Principale</h3>
                <p className="text-xs text-slate-400">Personnaliser les accents</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => setSettings({ ...settings, primaryColor: c })}
                  className={cn(
                    "w-10 h-10 rounded-full border-4 transition-all flex items-center justify-center",
                    settings.primaryColor === c 
                      ? (settings.darkMode ? "border-slate-700 ring-2 ring-white scale-110" : "border-white ring-2 ring-slate-900 scale-110") 
                      : "border-transparent"
                  )}
                  style={{ backgroundColor: c }}
                >
                  {settings.primaryColor === c && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn(
      "min-h-screen transition-all duration-500",
      settings.darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900",
      settings.fontFamily === 'serif' ? "font-serif" : 
      settings.fontFamily === 'mono' ? "font-mono" : 
      settings.fontFamily === 'outfit' ? "font-outfit" :
      settings.fontFamily === 'space' ? "font-space" :
      settings.fontFamily === 'libre' ? "font-libre" : 
      settings.fontFamily === 'montserrat' ? "font-montserrat" :
      settings.fontFamily === 'raleway' ? "font-raleway" :
      settings.fontFamily === 'lora' ? "font-lora" :
      settings.fontFamily === 'fira' ? "font-fira" :
      settings.fontFamily === 'quicksand' ? "font-quicksand" : "font-sans"
    )}>
      {/* Header with Navigation */}
      <header className={cn(
        "border-b sticky top-0 z-50 transition-colors duration-500",
        settings.darkMode ? "bg-slate-900/80 backdrop-blur-md border-slate-800" : "bg-white border-slate-200"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-4">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-500"
                style={{ backgroundColor: settings.primaryColor, boxShadow: `0 10px 15px -3px ${settings.primaryColor}33` }}
              >
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div className="block">
                <h1 className="font-bold text-lg leading-none tracking-tight">Mon Budget</h1>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">Gestionnaire Personnel</p>
              </div>
            </div>
          </div>
          
          <nav className="flex items-center justify-between sm:justify-end gap-1 sm:gap-4 overflow-x-auto scrollbar-hide w-full sm:w-auto">
            {[
              { id: 'home', label: 'Accueil', icon: LayoutDashboard },
              { id: 'expenses', label: 'Dépenses', icon: ListIcon },
              { id: 'stats', label: 'Stats', icon: BarChart3 },
              { id: 'settings', label: 'Options', icon: SettingsIcon }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 whitespace-nowrap",
                  activeTab === tab.id 
                    ? (settings.darkMode ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-900") 
                    : "text-slate-400 hover:text-slate-600"
                )}
                style={{ color: activeTab === tab.id ? settings.primaryColor : undefined }}
              >
                <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "opacity-100" : "opacity-40")} />
                <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
          </nav>
          
          <div className="flex items-center justify-between sm:justify-end gap-4">
            {!isOnline && (
              <div className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border animate-pulse",
                settings.darkMode ? "bg-amber-900/20 border-amber-800/30 text-amber-400" : "bg-amber-50 border-amber-100 text-amber-600"
              )}>
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Mode Hors-ligne
              </div>
            )}
            <div className={cn("flex items-center rounded-xl px-4 py-2 gap-3 border transition-all duration-300 shadow-sm", settings.darkMode ? "bg-slate-800 border-slate-700 hover:border-slate-600" : "bg-slate-100 border-slate-200 hover:border-slate-300")}>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <input 
                  type="month" 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-sm font-black p-0 w-32 cursor-pointer uppercase"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Installation Tip for Mobile */}
        <div className={cn("border rounded-2xl p-4 mb-10 flex items-start gap-3 sm:hidden", settings.darkMode ? "bg-blue-900/20 border-blue-800/30" : "bg-blue-50 border-blue-100")}>
          <div className={cn("p-2 rounded-lg", settings.darkMode ? "bg-blue-800/40 text-blue-400" : "bg-blue-100 text-blue-600")}>
            <Download className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className={cn("text-xs font-bold uppercase tracking-tight mb-1", settings.darkMode ? "text-blue-300" : "text-blue-800")}>Installer sur votre mobile</p>
            <p className={cn("text-[10px] leading-relaxed mb-3", settings.darkMode ? "text-blue-400/80" : "text-blue-600")}>
              {deferredPrompt 
                ? "Vous pouvez installer cette application sur votre écran d'accueil pour un accès rapide."
                : "Appuyez sur les 3 points (⋮) ou l'icône de partage de votre navigateur et choisissez \"Ajouter à l'écran d'accueil\"."}
            </p>
            {deferredPrompt && (
              <button 
                onClick={handleInstallClick}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all",
                  settings.darkMode ? "bg-blue-500 text-white hover:bg-blue-400" : "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                Installer maintenant
              </button>
            )}
          </div>
        </div>

        {activeTab === 'home' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Summary Card */}
            <div 
              className="rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden transition-all duration-500"
              style={{ backgroundColor: settings.darkMode ? '#0f172a' : '#0f172a', boxShadow: `0 25px 50px -12px ${settings.darkMode ? '#000000' : '#cbd5e1'}` }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full -ml-12 -mb-12 blur-2xl" />
              
              <div className="flex items-center justify-between mb-2">
                <div className="flex flex-col">
                  <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest">Solde Restant</p>
                  <p className="text-emerald-500/80 text-[10px] font-bold uppercase tracking-widest mt-1">
                    {formatMonthYear(selectedMonth)}
                  </p>
                </div>
                <Wallet className="w-8 h-8 text-emerald-500/50" />
              </div>
              <h3 className="text-5xl font-bold tracking-tighter mb-8">
                {formatCurrency(totals.remaining)}
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <span className="text-slate-400 text-sm">Total Revenus</span>
                  <span className="font-mono font-bold text-emerald-400">+{formatCurrency(totals.income)}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <span className="text-slate-400 text-sm">Total Dépenses</span>
                  <span className="font-mono font-bold text-rose-400">-{formatCurrency(totals.totalExpenses)}</span>
                </div>
              </div>

              <div className="mt-8 pt-6">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  <span>Utilisation du budget</span>
                  <span>{Math.round((totals.totalExpenses / totals.income) * 100) || 0}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(100, (totals.totalExpenses / totals.income) * 100) || 0}%`,
                      backgroundColor: settings.primaryColor
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Savings Info Card */}
            {totals.savings > 0 && (
              <div className={cn(
                "rounded-3xl p-6 border transition-all duration-500",
                settings.darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-sm"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-3 rounded-2xl", settings.darkMode ? "bg-violet-500/10 text-violet-400" : "bg-violet-50 text-violet-600")}>
                      <PiggyBank className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={cn("text-xs font-bold uppercase tracking-wider", settings.darkMode ? "text-slate-500" : "text-slate-400")}>Épargne (Info)</p>
                      <p className={cn("text-xl font-bold tracking-tight", settings.darkMode ? "text-slate-200" : "text-slate-900")}>
                        {formatCurrency(totals.savings)}
                      </p>
                    </div>
                  </div>
                  <div className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", settings.darkMode ? "bg-slate-800 text-slate-400" : "bg-slate-50 text-slate-500")}>
                    Argent disponible
                  </div>
                </div>
              </div>
            )}

            {/* Distribution by Icon Card */}
            <DistributionByIcon items={items} settings={settings} />

            {/* Chart Card */}
            <div className={cn("rounded-2xl p-6 shadow-sm border", settings.darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
              <div className="flex items-center gap-2 mb-6">
                <PieChartIcon className="w-5 h-5 text-slate-400" />
                <h3 className="font-bold">Répartition</h3>
              </div>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        backgroundColor: settings.darkMode ? '#0f172a' : '#fff',
                        color: settings.darkMode ? '#fff' : '#000'
                      }}
                      itemStyle={{ color: settings.darkMode ? '#fff' : '#000' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 space-y-2">
                {chartData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-400 font-medium">{item.name}</span>
                    </div>
                    <span className="font-mono font-bold">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips Card */}
            <div className={cn("rounded-2xl p-6 border", settings.darkMode ? "bg-emerald-900/20 border-emerald-800/30" : "bg-emerald-50 border-emerald-100")}>
              <h4 className={cn("font-bold text-sm mb-2", settings.darkMode ? "text-emerald-400" : "text-emerald-800")}>Conseil Budgétaire</h4>
              <p className={cn("text-xs leading-relaxed", settings.darkMode ? "text-emerald-500/80" : "text-emerald-700")}>
                {totals.remaining > 0 
                  ? `Bravo ! Il vous reste ${formatCurrency(totals.remaining)} ce mois-ci. Envisagez de placer une partie de ce surplus en épargne de précaution.`
                  : "Attention, vos d\u00e9penses d\u00e9passent vos revenus. Essayez de r\u00e9duire vos d\u00e9penses variables pour \u00e9quilibrer votre budget."}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Section 
              title="Revenus" 
              category="income" 
              icon={ArrowUpCircle} 
              colorClass={settings.darkMode ? "bg-emerald-900/40" : ""} 
              customColor={currentCategoryColors.income}
            />
            
            <Section 
              title="Charges Fixes" 
              category="fixed" 
              icon={ArrowDownCircle} 
              colorClass={settings.darkMode ? "bg-amber-900/40" : ""} 
              customColor={currentCategoryColors.fixed}
            />

            <Section 
              title="Dépenses Variables" 
              category="variable" 
              icon={ArrowDownCircle} 
              colorClass={settings.darkMode ? "bg-blue-900/40" : ""} 
              customColor={currentCategoryColors.variable}
            />

            <Section 
              title="Épargne (Info)" 
              category="savings" 
              icon={Save} 
              colorClass={settings.darkMode ? "bg-violet-900/40" : ""} 
              customColor={currentCategoryColors.savings}
            />
          </div>
        )}

        {activeTab === 'stats' && <StatsView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>
    </div>
  );
}
