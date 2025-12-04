import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Save, RotateCcw, AlertCircle, Eye, Pencil, Shield, GitBranch } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import JsonViewer from '@/components/ucp/JsonViewer';
import RuleEditor from '@/components/ucp/RuleEditor';
import UcpStatusBadge from '@/components/ucp/UcpStatusBadge';
import RoutingBreakdown from '@/components/ucp/RoutingBreakdown';
import { UcpRouterService, DEFAULT_ROUTER_PACKET } from '@/components/ucp/UcpService';

export default function RouterPacketPage() {
  const [editedPacket, setEditedPacket] = useState(null);
  const [activeTab, setActiveTab] = useState('view');
  const queryClient = useQueryClient();

  // Fetch current packet from backend service
  const { data: packetResponse, isLoading } = useQuery({
    queryKey: ['routerPacket'],
    queryFn: () => UcpRouterService.getRouterPacket(),
  });

  const currentPacket = packetResponse?.packet || null;
  const displayPacket = editedPacket || currentPacket || DEFAULT_ROUTER_PACKET;

  // Initialize edited packet when data loads
  useEffect(() => {
    if (currentPacket && !editedPacket) {
      setEditedPacket({ ...currentPacket });
    } else if (!currentPacket && !editedPacket) {
      setEditedPacket({ ...DEFAULT_ROUTER_PACKET });
    }
  }, [currentPacket]);

  // Save mutation - uses backend service
  const saveMutation = useMutation({
    mutationFn: async (packet) => {
      const response = await UcpRouterService.updateRouterPacket(packet);
      if (!response.success) {
        throw new Error(response.error || 'Failed to save packet');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routerPacket'] });
      toast.success('Router Packet Updated (Patent Pending) — All future queries now follow this version.');
    },
    onError: (error) => {
      toast.error(`Failed to save: ${error.message}`);
    }
  });

  const handleRulesChange = (newRules) => {
    setEditedPacket({
      ...editedPacket,
      selection_policy: {
        ...editedPacket.selection_policy,
        rules: newRules
      }
    });
  };

  const handleAddRule = () => {
    const newRule = {
      condition: {},
      choose_model: editedPacket.models[0]?.id || 'fast_model'
    };
    handleRulesChange([...editedPacket.selection_policy.rules, newRule]);
  };

  const handleRemoveRule = (index) => {
    const newRules = editedPacket.selection_policy.rules.filter((_, i) => i !== index);
    handleRulesChange(newRules);
  };

  const handleFallbackChange = (value) => {
    setEditedPacket({
      ...editedPacket,
      selection_policy: {
        ...editedPacket.selection_policy,
        fallback_model: value
      }
    });
  };

  const handleReset = () => {
    setEditedPacket(currentPacket ? { ...currentPacket } : { ...DEFAULT_ROUTER_PACKET });
    toast.info('Changes reverted');
  };

  const handleSave = () => {
    saveMutation.mutate(editedPacket);
  };

  const hasChanges = JSON.stringify(editedPacket) !== JSON.stringify(currentPacket || DEFAULT_ROUTER_PACKET);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Router Packet</h1>
                <p className="text-sm text-slate-500">Configure UCP routing rules and model selection</p>
              </div>
            </div>
            <UcpStatusBadge showDetails />
          </div>
        </div>

        {/* Patent Pending Notice */}
        <Card className="border-0 shadow-md bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200 mb-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-violet-900">
                  This is the UCP Routing Packet (Patent Pending)
                </p>
                <p className="text-xs text-violet-700 mt-1">
                  All routing behavior is derived from this standardized, deterministic configuration file.
                  UCP Router Packets are portable inference rules — Patent Pending under Application No. 63/928,882.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-100 p-1">
            <TabsTrigger value="view" className="gap-2">
              <Eye className="w-4 h-4" />
              View JSON
            </TabsTrigger>
            <TabsTrigger value="edit" className="gap-2">
              <Pencil className="w-4 h-4" />
              Edit Rules
            </TabsTrigger>
          </TabsList>

          {/* View Tab */}
          <TabsContent value="view" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* JSON Viewer */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Current Router Packet</CardTitle>
                  <CardDescription>
                    UCP version {displayPacket.ucp_version} • {displayPacket.models?.length || 0} models configured
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <JsonViewer data={displayPacket} className="max-h-[400px]" />
                </CardContent>
              </Card>

              {/* Live Routing Breakdown */}
              <RoutingBreakdown packet={displayPacket} />
            </div>
          </TabsContent>

          {/* Edit Tab */}
          <TabsContent value="edit" className="space-y-6">
            {/* Models Overview */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Available Models</CardTitle>
                <CardDescription>Models registered in this router packet</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {editedPacket?.models?.map((model) => (
                    <div
                      key={model.id}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-800">{model.id}</span>
                        <div className="flex gap-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                            Quality: {model.qualityScore}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                            Cost: {model.costScore}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500">{model.description}</p>
                      <p className="text-xs text-slate-400 mt-1">Max tokens: {model.maxTokens}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Selection Rules */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Selection Rules</CardTitle>
                <CardDescription>
                  Rules are evaluated in order. First matching rule determines the model.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RuleEditor
                  rules={editedPacket?.selection_policy?.rules || []}
                  models={editedPacket?.models || []}
                  onChange={handleRulesChange}
                  onAdd={handleAddRule}
                  onRemove={handleRemoveRule}
                />
              </CardContent>
            </Card>

            {/* Fallback Model */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Fallback Model</CardTitle>
                <CardDescription>
                  Used when no selection rules match the prompt
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-w-xs">
                  <Label className="text-xs text-slate-500 mb-2 block">Default Model</Label>
                  <Select
                    value={editedPacket?.selection_policy?.fallback_model || ''}
                    onValueChange={handleFallbackChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {editedPacket?.models?.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                {hasChanges && (
                  <span className="flex items-center gap-1 text-sm text-amber-600">
                    <AlertCircle className="w-4 h-4" />
                    Unsaved changes
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={!hasChanges || saveMutation.isPending}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Revert
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!hasChanges || saveMutation.isPending}
                  className="bg-slate-900 hover:bg-slate-800"
                >
                  {saveMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Packet
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}