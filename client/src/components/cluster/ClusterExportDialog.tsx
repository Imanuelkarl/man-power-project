// src/components/cluster/ClusterExportDialog.tsx

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { Search, Download, FileSpreadsheet, FileText, File } from "lucide-react";
import type { ClusterWithStats } from "../../types/cluster.types";
import type { Manufacturer } from "../../types/manufacturer.types";
import type { PowerData } from "../../types/powerData.types";
import { EXPORT_PARAMETERS, PARAMETER_CATEGORIES } from "../../lib/export-parameters";
import { exportClustersExcel, exportClustersCSV, exportClustersPDF } from "../../lib/cluster-export";

interface ClusterExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clusters: ClusterWithStats[];
  manufacturers: Manufacturer[];
  questionnaires: PowerData[];
  selectedClusterIds?: string[];
}

type ExportFormat = "excel" | "csv" | "pdf";

export const ClusterExportDialog: React.FC<ClusterExportDialogProps> = ({
  open,
  onOpenChange,
  clusters,
  manufacturers,
  questionnaires,
  selectedClusterIds,
}) => {
  const [format, setFormat] = useState<ExportFormat>("excel");
  const [selectedParams, setSelectedParams] = useState<string[]>(
    EXPORT_PARAMETERS.slice(0, 10).map(p => p.id)
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Filter clusters
  const exportClusters = useMemo(() => {
    if (selectedClusterIds && selectedClusterIds.length > 0) {
      return clusters.filter(c => selectedClusterIds.includes(c.id));
    }
    return clusters;
  }, [clusters, selectedClusterIds]);

  const filteredParameters = useMemo(() => {
    let params = EXPORT_PARAMETERS;
    if (searchTerm) {
      params = params.filter(p => 
        p.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (activeTab !== "all") {
      params = params.filter(p => p.category === activeTab);
    }
    return params;
  }, [searchTerm, activeTab]);

  const toggleParameter = (paramId: string) => {
    setSelectedParams(prev => 
      prev.includes(paramId)
        ? prev.filter(id => id !== paramId)
        : [...prev, paramId]
    );
  };

  const selectAll = () => {
    setSelectedParams(EXPORT_PARAMETERS.map(p => p.id));
  };

  const deselectAll = () => {
    setSelectedParams([]);
  };

  const toggleCategory = (category: string) => {
    const categoryParams = EXPORT_PARAMETERS.filter(p => p.category === category);
    const categoryIds = categoryParams.map(p => p.id);
    const allSelected = categoryIds.every(id => selectedParams.includes(id));
    
    if (allSelected) {
      setSelectedParams(prev => prev.filter(id => !categoryIds.includes(id)));
    } else {
      setSelectedParams(prev => [...new Set([...prev, ...categoryIds])]);
    }
  };

  const getCategoryCount = (category: string) => {
    const total = EXPORT_PARAMETERS.filter(p => p.category === category).length;
    const selected = EXPORT_PARAMETERS.filter(p => 
      p.category === category && selectedParams.includes(p.id)
    ).length;
    return { total, selected };
  };

  const handleExport = () => {
    if (selectedParams.length === 0) {
      alert("Please select at least one parameter to export.");
      return;
    }

    const exportFn = {
      excel: exportClustersExcel,
      csv: exportClustersCSV,
      pdf: exportClustersPDF,
    }[format];

    const filename = `MAN-Cluster-Export-${new Date().toISOString().slice(0, 10)}`;

    exportFn(
      exportClusters,
      manufacturers,
      questionnaires,
      selectedParams,
      `${filename}.${format === 'pdf' ? 'pdf' : format === 'excel' ? 'xlsx' : 'csv'}`
    );

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Export Cluster Data</DialogTitle>
          <DialogDescription>
            Select the data parameters you want to include in the export.
            {exportClusters.length > 0 && (
              <span className="block text-sm text-muted-foreground mt-1">
                Exporting {exportClusters.length} cluster{exportClusters.length > 1 ? 's' : ''} with {exportClusters.reduce((acc, c) => acc + c.manufacturerIds.length, 0)} companies
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-0">
          {/* Left side - Parameter selection */}
          <div className="md:col-span-2 flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search parameters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button variant="outline" size="sm" onClick={selectAll}>
                All
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                None
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 min-h-0">
              <TabsList className="gap-2 grid grid-cols-4 mb-3 h-auto overflow-x-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                {Object.entries(PARAMETER_CATEGORIES).map(([key, label]) => {
                  const { selected, total } = getCategoryCount(key);
                  return (
                    <TabsTrigger key={key} value={key} className="relative">
                      <span className="w-40 text-wrap">{label}</span>
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {selected}/{total}
                      </Badge>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <ScrollArea className="flex-1 h-[300px] border rounded-md p-3">
                {Object.entries(PARAMETER_CATEGORIES).map(([categoryKey, categoryLabel]) => {
                  const params = filteredParameters.filter(p => p.category === categoryKey);
                  if (params.length === 0) return null;

                  const categoryParams = EXPORT_PARAMETERS.filter(p => p.category === categoryKey);
                  const allSelected = categoryParams.every(p => selectedParams.includes(p.id));

                  return (
                    <div key={categoryKey} className="mb-4">
                      <div 
                        className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-muted/50 p-1 rounded"
                        onClick={() => toggleCategory(categoryKey)}
                      >
                        <Checkbox checked={allSelected} />
                        <span className="font-medium">{categoryLabel}</span>
                        <span className="text-xs text-muted-foreground">
                          ({params.length} parameters)
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pl-6">
                        {params.map(param => (
                          <div key={param.id} className="flex items-center gap-2">
                            <Checkbox
                              id={param.id}
                              checked={selectedParams.includes(param.id)}
                              onCheckedChange={() => toggleParameter(param.id)}
                            />
                            <Label htmlFor={param.id} className="text-sm cursor-pointer">
                              {param.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </ScrollArea>
            </Tabs>
          </div>

          {/* Right side - Export settings */}
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Export Format</h4>
              <RadioGroup value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="excel" id="excel" />
                  <Label htmlFor="excel" className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-green-600" />
                    Excel (.xlsx)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="csv" id="csv" />
                  <Label htmlFor="csv" className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    CSV (.csv)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pdf" id="pdf" />
                  <Label htmlFor="pdf" className="flex items-center gap-2">
                    <File className="h-4 w-4 text-red-600" />
                    PDF (.pdf)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Parameters selected:</span>
                  <span className="font-medium">{selectedParams.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Clusters:</span>
                  <span className="font-medium">{exportClusters.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Companies:</span>
                  <span className="font-medium">
                    {exportClusters.reduce((acc, c) => acc + c.manufacturerIds.length, 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Quick Select</h4>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    const ids = EXPORT_PARAMETERS
                      .filter(p => ['cluster', 'manufacturer'].includes(p.category))
                      .map(p => p.id);
                    setSelectedParams(ids);
                  }}
                >
                  Basic Info
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    const ids = EXPORT_PARAMETERS
                      .filter(p => p.category === 'questionnaire')
                      .map(p => p.id);
                    setSelectedParams(ids);
                  }}
                >
                  All Questionnaire
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    const ids = EXPORT_PARAMETERS
                      .filter(p => ['energy', 'production'].some(c => p.id.includes(c)))
                      .map(p => p.id);
                    setSelectedParams(ids);
                  }}
                >
                  Energy & Production
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export {format.toUpperCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};