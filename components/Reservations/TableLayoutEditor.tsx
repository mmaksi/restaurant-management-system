'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, RotateCcw, Trash2, Bookmark } from 'lucide-react';
import { toast } from 'sonner';

import type { Floor, RestaurantTable, TableShape, TableStatus } from '@/lib/types';
import { DEMO_FLOORS } from '@/lib/constants';
import {
  applyStatusesForSlot,
  defaultLayoutKey,
  loadDefaultLayout,
  loadReservations,
  loadSlotLayoutOrDefault,
  saveJson,
} from '@/lib/helpers/reservations-storage';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type TableSizeOption = 'small' | 'medium' | 'large' | 'xlarge';
type CanvasMode = 'select' | 'edit';

function getSizeForTable(table: RestaurantTable) {
  // We currently treat "size" as a visual size, derived from capacity.
  // This keeps compatibility with the existing data model.
  const cap = table.capacity ?? 2;

  if (cap <= 2) return { w: 72, h: 48 };
  if (cap <= 4) return { w: 84, h: 84 };
  if (cap <= 6) return { w: 96, h: 96 };
  return { w: 120, h: 84 };
}

function statusClasses(status: TableStatus) {
  switch (status) {
    case 'available':
      return 'bg-emerald-100 border-emerald-300 text-emerald-900';
    case 'reserved':
      return 'bg-amber-100 border-amber-300 text-amber-900';
    case 'occupied':
      return 'bg-rose-100 border-rose-300 text-rose-900';
    default:
      return 'bg-slate-100 border-slate-300 text-slate-900';
  }
}

function shapeStyle(shape: TableShape, w: number, h: number) {
  if (shape === 'circle') {
    const s = Math.max(w, h);
    return { width: s, height: s, borderRadius: 9999 };
  }
  if (shape === 'square') {
    const s = Math.max(w, h);
    return { width: s, height: s, borderRadius: 12 };
  }
  return { width: Math.max(w, h), height: Math.min(w, h), borderRadius: 12 };
}

function nextTableNumber(tables: RestaurantTable[]) {
  const used = new Set(tables.map((t) => t.number));
  let n = 1;
  while (used.has(n)) n += 1;
  return n;
}

function sizeToCapacity(size: TableSizeOption) {
  // This is a temporary mapping; we can introduce an explicit "size" field later.
  if (size === 'small') return 2;
  if (size === 'medium') return 4;
  if (size === 'large') return 6;
  return 8;
}

function StatusLegend() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
      <div className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
        <span>Available</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
        <span>Reserved</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
        <span>Occupied</span>
      </div>
    </div>
  );
}

export default function TableLayoutEditor({
  restaurantId,
  date,
  time,
  guests,
  refreshKey,
  onSelectionChange,
  onLayoutChange,
}: {
  restaurantId: string;
  date: string;
  time: string;
  guests: number;
  refreshKey?: number;
  onSelectionChange?: (data: {
    floorId: string;
    selectedTables: RestaurantTable[];
  }) => void;
  onLayoutChange?: (data: { floorId: string; tables: RestaurantTable[] }) => void;
}) {
  const floors: Floor[] = useMemo(() => {
    // Use existing demo floors but scope them to the currently selected restaurant.
    return DEMO_FLOORS.map((f) => ({ ...f, restaurant_id: restaurantId }));
  }, [restaurantId]);

  const [activeFloorId, setActiveFloorId] = useState<string>(floors[0]?.id ?? 'floor-1');
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedForReservation, setSelectedForReservation] = useState<string[]>([]);
  const [mode, setMode] = useState<CanvasMode>('select');
  const [reservations, setReservations] = useState(() => loadReservations(restaurantId));

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    tableId: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const selectedTable = useMemo(
    () => tables.find((t) => t.id === selectedTableId) ?? null,
    [tables, selectedTableId]
  );

  useEffect(() => {
    setReservations(loadReservations(restaurantId));
  }, [restaurantId, refreshKey]);

  const selectedTablesForReservation = useMemo(() => {
    const selectedSet = new Set(selectedForReservation);
    return tables.filter((t) => selectedSet.has(t.id));
  }, [tables, selectedForReservation]);

  // Notify parent about current selection/floor
  useEffect(() => {
    onSelectionChange?.({
      floorId: activeFloorId,
      selectedTables: selectedTablesForReservation,
    });
  }, [activeFloorId, onSelectionChange, selectedTablesForReservation]);

  // Notify parent about current layout/floor (used when finalizing reservation)
  useEffect(() => {
    onLayoutChange?.({ floorId: activeFloorId, tables });
  }, [activeFloorId, onLayoutChange, tables]);

  // Load tables when restaurant/floor/date/time changes
  useEffect(() => {
    if (!date || !time) {
      const fallback = loadDefaultLayout(restaurantId, activeFloorId);
      setTables(fallback);
      setSelectedTableId(null);
      setSelectedForReservation([]);
      return;
    }

    const base = loadSlotLayoutOrDefault({
      restaurantId,
      floorId: activeFloorId,
      date,
      time,
    });
    const withStatuses = applyStatusesForSlot({
      tables: base,
      date,
      time,
      reservations,
    });

    setTables(withStatuses);
    setSelectedTableId(null);
    setSelectedForReservation([]);
  }, [restaurantId, activeFloorId, date, time, reservations]);

  // Drag handling (pointer events + clamping to canvas)
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current) return;
      const { tableId, offsetX, offsetY } = dragRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - offsetX;
      const y = e.clientY - rect.top - offsetY;

      setTables((prev) => {
        const idx = prev.findIndex((t) => t.id === tableId);
        if (idx === -1) return prev;

        const t = prev[idx];
        // Reserved/occupied tables cannot be moved.
        if (t.status !== 'available') return prev;
        const { w, h } = getSizeForTable(t);
        const styled = shapeStyle(t.shape, w, h);
        const maxX = rect.width - (styled.width as number) - 4;
        const maxY = rect.height - (styled.height as number) - 4;

        const clampedX = Math.max(4, Math.min(x, maxX));
        const clampedY = Math.max(4, Math.min(y, maxY));

        const next = [...prev];
        next[idx] = { ...t, position: { x: clampedX, y: clampedY } };
        return next;
      });
    };

    const onUp = () => {
      dragRef.current = null;
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  const handleSaveAsDefault = () => {
    const key = defaultLayoutKey(restaurantId, activeFloorId);
    // Default layout always stores tables as "available".
    const asDefault = tables.map((t) => ({ ...t, status: 'available' as TableStatus }));
    saveJson(key, asDefault);
    toast.success('Default layout saved for this floor');
  };

  const handleReset = () => {
    const defaults = loadDefaultLayout(restaurantId, activeFloorId);
    const withStatuses =
      date && time
        ? applyStatusesForSlot({ tables: defaults, date, time, reservations })
        : defaults;
    setTables(withStatuses);
    setSelectedTableId(null);
    setSelectedForReservation([]);
    toast.message('Reset to floor default (not yet saved)');
  };

  const handleDeleteSelected = () => {
    if (!selectedTable) return;
    if (selectedTable.status !== 'available') {
      toast.error('This table cannot be modified while reserved/occupied');
      return;
    }
    setTables((prev) => prev.filter((t) => t.id !== selectedTable.id));
    setSelectedTableId(null);
    toast.message(`Table ${selectedTable.number} removed (not yet saved)`);
  };

  const handleUpdateSelected = (patch: Partial<RestaurantTable>) => {
    if (!selectedTable) return;
    if (selectedTable.status !== 'available') {
      toast.error('This table cannot be modified while reserved/occupied');
      return;
    }
    setTables((prev) =>
      prev.map((t) => (t.id === selectedTable.id ? { ...t, ...patch } : t))
    );
  };

  const totalSelectedCapacity = useMemo(() => {
    return selectedTablesForReservation.reduce((sum, t) => sum + (t.capacity ?? 0), 0);
  }, [selectedTablesForReservation]);

  return (
    <Card className="bg-white rounded-xl shadow-md p-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              Default tables layout
            </h2>
            <div className="mt-2">
              <StatusLegend />
            </div>
            <p className="text-sm text-slate-600 mt-5">
              Edit layout per date/time and select tables to reserve.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleReset}
              variant="outline"
              className="rounded-lg"
              type="button"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </Button>
            <Button
              onClick={handleSaveAsDefault}
              variant="outline"
              className="rounded-lg"
              type="button"
            >
              <Bookmark className="w-4 h-4" />
              <span>Save default</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-4 items-start">
          {/* Toolbar row (spans both columns) */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:col-span-2">
            <Tabs value={activeFloorId} onValueChange={setActiveFloorId}>
              <TabsList className="bg-slate-100">
                {floors.map((f) => (
                  <TabsTrigger key={f.id} value={f.id}>
                    {f.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2">
              <Tabs value={mode} onValueChange={(v) => setMode(v as CanvasMode)}>
                <TabsList className="bg-slate-100">
                  <TabsTrigger value="select">Select</TabsTrigger>
                  <TabsTrigger value="edit">Edit</TabsTrigger>
                </TabsList>
              </Tabs>

              <AddTableDialog
                tables={tables}
                onAdd={(t) => setTables((prev) => [...prev, t])}
                floorId={activeFloorId}
                canvasRef={canvasRef}
                disabled={mode !== 'edit'}
              />
            </div>
          </div>

          {/* Canvas column */}
          <div className="min-w-0">
            <div
              ref={canvasRef}
              className="relative w-full h-[520px] rounded-xl border border-slate-200 bg-[linear-gradient(to_right,rgba(148,163,184,0.20)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.20)_1px,transparent_1px)] bg-[size:24px_24px] overflow-hidden"
              onPointerDown={() => {
                if (mode === 'edit') setSelectedTableId(null);
              }}
              role="application"
              aria-label="Tables layout canvas"
            >
              {tables.map((table) => {
                const pos = table.position ?? { x: 40, y: 40 };
                const { w, h } = getSizeForTable(table);
                const style = shapeStyle(table.shape, w, h);
                const isSelected = table.id === selectedTableId;
                const isSelectedForReservation = selectedForReservation.includes(table.id);

                return (
                  <button
                    key={table.id}
                    type="button"
                    className={[
                      'absolute border-2 shadow-sm flex items-center justify-center font-semibold select-none',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500',
                      statusClasses(table.status),
                      mode === 'edit' && isSelected ? 'ring-2 ring-blue-500' : '',
                      mode === 'select' && isSelectedForReservation
                        ? 'ring-2 ring-slate-900'
                        : '',
                      table.status !== 'available' ? 'cursor-not-allowed opacity-90' : '',
                    ].join(' ')}
                    style={{
                      left: pos.x,
                      top: pos.y,
                      ...style,
                    }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      if (mode === 'select') {
                        if (table.status !== 'available') return;
                        setSelectedForReservation((prev) => {
                          const has = prev.includes(table.id);
                          return has
                            ? prev.filter((id) => id !== table.id)
                            : [...prev, table.id];
                        });
                        return;
                      }

                      // edit mode
                      setSelectedTableId(table.id);
                      if (table.status !== 'available') return;
                      const canvas = canvasRef.current;
                      if (!canvas) return;
                      const canvasRect = canvas.getBoundingClientRect();
                      const offX = e.clientX - canvasRect.left - (pos.x ?? 0);
                      const offY = e.clientY - canvasRect.top - (pos.y ?? 0);
                      dragRef.current = { tableId: table.id, offsetX: offX, offsetY: offY };
                    }}
                    aria-label={`Table ${table.number}`}
                    title={`Table ${table.number} (${table.status})`}
                  >
                    <div className="flex flex-col items-center leading-none">
                      <span className="text-sm">T{table.number}</span>
                      <span className="text-[10px] font-medium opacity-80">
                        {table.capacity}p
                      </span>
                    </div>
                  </button>
                );
              })}

              {tables.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">
                  No tables yet. Click “Add table” to start.
                </div>
              )}
            </div>

            <p className="mt-2 text-xs text-slate-500">
              {mode === 'select'
                ? 'Select available tables to reserve. Reserved/occupied tables are locked.'
                : 'Edit the layout for this date/time. Reserved/occupied tables cannot be moved.'}
            </p>
          </div>

          {/* Side panel column (aligned with canvas top) */}
          <div className="w-full md:w-[320px] md:flex-shrink-0">
            <Card className="bg-slate-50 border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  {mode === 'select' ? 'Selection' : 'Table properties'}
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-lg"
                  disabled={!selectedTable || mode !== 'edit'}
                  onClick={handleDeleteSelected}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </Button>
              </div>

              {mode === 'select' ? (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Guests</span>
                    <span className="font-semibold text-slate-900">{guests}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Selected capacity</span>
                    <span className="font-semibold text-slate-900">{totalSelectedCapacity}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Selected tables</span>
                    <span className="font-semibold text-slate-900">
                      {selectedTablesForReservation.length}
                    </span>
                  </div>
                  {selectedTablesForReservation.length > 0 &&
                    totalSelectedCapacity < guests && (
                      <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-amber-900">
                        <p className="text-xs font-semibold">
                          Not enough capacity selected
                        </p>
                        <p className="text-xs">
                          Select tables totaling at least{' '}
                          <span className="font-semibold">{guests}</span> seats.
                        </p>
                      </div>
                    )}
                  {selectedTablesForReservation.length > 0 && (
                    <p className="text-xs text-slate-600">
                      {selectedTablesForReservation
                        .map((t) => `T${t.number}`)
                        .sort((a, b) => a.localeCompare(b))
                        .join(', ')}
                    </p>
                  )}
                  <p className="text-xs text-slate-500">
                    Tip: switch to “Edit” to adjust the layout (available tables only).
                  </p>
                </div>
              ) : !selectedTable ? (
                <p className="text-sm text-slate-600">
                  Click a table on the canvas to edit its number/shape/size.
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="table-number">Table number</Label>
                    <Input
                      id="table-number"
                      type="number"
                      value={selectedTable.number}
                      min={1}
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        if (!Number.isFinite(next) || next < 1) return;
                        handleUpdateSelected({ number: next });
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Shape</Label>
                      <Select
                        value={selectedTable.shape}
                        onValueChange={(v) =>
                          handleUpdateSelected({ shape: v as TableShape })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rectangle">Rectangle</SelectItem>
                          <SelectItem value="square">Square</SelectItem>
                          <SelectItem value="circle">Circle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label>Size</Label>
                      <Select
                        value={capacityToSize(selectedTable.capacity)}
                        onValueChange={(v) =>
                          handleUpdateSelected({ capacity: sizeToCapacity(v as TableSizeOption) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small (2p)</SelectItem>
                          <SelectItem value="medium">Medium (4p)</SelectItem>
                          <SelectItem value="large">Large (6p)</SelectItem>
                          <SelectItem value="xlarge">XL (8p)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label>Status</Label>
                    <Input value={selectedTable.status} readOnly />
                    <p className="text-xs text-slate-500">
                      Reserved/occupied tables are locked for this date/time.
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </Card>
  );
}

function capacityToSize(capacity: number): TableSizeOption {
  if (capacity <= 2) return 'small';
  if (capacity <= 4) return 'medium';
  if (capacity <= 6) return 'large';
  return 'xlarge';
}

function AddTableDialog({
  tables,
  onAdd,
  floorId,
  canvasRef,
  disabled,
}: {
  tables: RestaurantTable[];
  onAdd: (t: RestaurantTable) => void;
  floorId: string;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [shape, setShape] = useState<TableShape>('rectangle');
  const [size, setSize] = useState<TableSizeOption>('small');
  const [number, setNumber] = useState<number>(() => nextTableNumber(tables));

  useEffect(() => {
    if (!open) return;
    setNumber(nextTableNumber(tables));
  }, [open, tables]);

  const handleAdd = () => {
    const used = new Set(tables.map((t) => t.number));
    if (used.has(number)) {
      toast.error(`Table number ${number} already exists on this floor`);
      return;
    }

    const canvas = canvasRef.current;
    const center = canvas
      ? { x: Math.max(12, canvas.clientWidth / 2 - 50), y: Math.max(12, canvas.clientHeight / 2 - 50) }
      : { x: 60, y: 60 };

    const capacity = sizeToCapacity(size);
    const isMergeable = capacity <= 4;

    const newTable: RestaurantTable = {
      id: `table-${Date.now()}`,
      number,
      shape,
      capacity,
      isMergeable,
      status: 'available',
      floor_id: floorId,
      position: center,
    };

    onAdd(newTable);
    setOpen(false);
    toast.success(`Table ${number} added`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          disabled={disabled}
          className="bg-slate-900 hover:bg-slate-800 rounded-lg disabled:bg-slate-300"
        >
          <Plus className="w-4 h-4" />
          <span>Add table</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Add a table</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="new-table-number">Number</Label>
            <Input
              id="new-table-number"
              type="number"
              min={1}
              value={number}
              onChange={(e) => setNumber(Number(e.target.value))}
            />
          </div>

          <div className="space-y-1">
            <Label>Shape</Label>
            <Select value={shape} onValueChange={(v) => setShape(v as TableShape)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rectangle">Rectangle</SelectItem>
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="circle">Circle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Size</Label>
            <Select value={size} onValueChange={(v) => setSize(v as TableSizeOption)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small (2p)</SelectItem>
                <SelectItem value="medium">Medium (4p)</SelectItem>
                <SelectItem value="large">Large (6p)</SelectItem>
                <SelectItem value="xlarge">XL (8p)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Status</Label>
            <Input value="available" readOnly />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" className="bg-blue-600 hover:bg-blue-700" onClick={handleAdd}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

