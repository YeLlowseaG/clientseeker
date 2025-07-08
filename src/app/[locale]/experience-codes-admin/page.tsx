"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Eye, EyeOff, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/contexts/app";

interface ExperienceCode {
  id: number;
  code: string;
  name: string;
  description: string;
  credits: number;
  valid_days: number;
  max_uses: number;
  used_count: number;
  is_active: boolean;
  created_at: string;
  expires_at: string;
}

interface ExperienceCodeUsage {
  id: number;
  code_id: number;
  user_email: string;
  used_at: string;
  credits_granted: number;
  ip_address: string;
}

interface ExperienceCodeForm {
  name: string;
  description: string;
  credits: number;
  valid_days: number;
  max_uses: number;
  is_active: boolean;
}

export default function ExperienceCodesPage() {
  const router = useRouter();
  const { user } = useAppContext();
  const [codes, setCodes] = useState<ExperienceCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<ExperienceCode | null>(null);
  const [usageDialogOpen, setUsageDialogOpen] = useState(false);
  const [selectedCodeUsages, setSelectedCodeUsages] = useState<ExperienceCodeUsage[]>([]);
  const [selectedCodeName, setSelectedCodeName] = useState("");
  const [formData, setFormData] = useState<ExperienceCodeForm>({
    name: "",
    description: "",
    credits: 10,
    valid_days: 30,
    max_uses: 1,
    is_active: true,
  });

  // 加载体验码列表
  const loadCodes = async () => {
    try {
      const response = await fetch("/api/admin/experience-codes");
      if (response.ok) {
        const result = await response.json();
        setCodes(result.codes || []);
      } else {
        toast.error("Failed to load experience codes");
      }
    } catch (error) {
      console.error("Load codes error:", error);
      toast.error("Failed to load experience codes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCodes();
  }, []);

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      credits: 10,
      valid_days: 30,
      max_uses: 1,
      is_active: true,
    });
    setEditingCode(null);
  };

  // 打开编辑对话框
  const openEditDialog = (code: ExperienceCode) => {
    setEditingCode(code);
    setFormData({
      name: code.name,
      description: code.description,
      credits: code.credits,
      valid_days: code.valid_days,
      max_uses: code.max_uses,
      is_active: code.is_active,
    });
    setIsDialogOpen(true);
  };

  // 创建或更新体验码
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    try {
      const url = editingCode 
        ? `/api/admin/experience-codes/${editingCode.id}`
        : "/api/admin/experience-codes";
      
      const method = editingCode ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(editingCode ? "Experience code updated successfully" : "Experience code created successfully");
        setIsDialogOpen(false);
        resetForm();
        loadCodes();
      } else {
        toast.error(result.error || "Operation failed");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Operation failed");
    }
  };

  // 删除体验码
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this experience code?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/experience-codes/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Experience code deleted successfully");
        loadCodes();
      } else {
        toast.error(result.error || "Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Delete failed");
    }
  };

  // 切换激活状态
  const toggleActive = async (id: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/experience-codes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: isActive }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(`Experience code ${isActive ? "activated" : "deactivated"} successfully`);
        loadCodes();
      } else {
        toast.error(result.error || "Operation failed");
      }
    } catch (error) {
      console.error("Toggle active error:", error);
      toast.error("Operation failed");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  // 查看使用记录
  const viewUsages = async (codeId: number, codeName: string) => {
    try {
      const response = await fetch(`/api/admin/experience-codes/${codeId}/usages`);
      if (response.ok) {
        const result = await response.json();
        setSelectedCodeUsages(result.usages || []);
        setSelectedCodeName(codeName);
        setUsageDialogOpen(true);
      } else {
        toast.error("Failed to load usage records");
      }
    } catch (error) {
      console.error("Load usages error:", error);
      toast.error("Failed to load usage records");
    }
  };


  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-xl font-semibold">体验码管理后台</h1>
      </div>
      <div className="flex flex-1 flex-col px-4 lg:px-6">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Experience Codes</h1>
              <p className="text-muted-foreground">
                Manage experience codes for user trials
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Code
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingCode ? "Edit Experience Code" : "Create Experience Code"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter code name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter description"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="credits">Credits</Label>
                      <Input
                        id="credits"
                        type="number"
                        value={formData.credits}
                        onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 0 })}
                        min="1"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="valid_days">Valid Days</Label>
                      <Input
                        id="valid_days"
                        type="number"
                        value={formData.valid_days}
                        onChange={(e) => setFormData({ ...formData, valid_days: parseInt(e.target.value) || 1 })}
                        min="1"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_uses">Maximum Uses</Label>
                    <Input
                      id="max_uses"
                      type="number"
                      value={formData.max_uses}
                      onChange={(e) => setFormData({ ...formData, max_uses: parseInt(e.target.value) || 1 })}
                      min="1"
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingCode ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Experience Codes List</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : codes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No experience codes found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Valid Days</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {codes.map((code) => (
                      <TableRow key={code.id}>
                        <TableCell className="font-mono text-sm">
                          {code.code}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{code.name}</div>
                            {code.description && (
                              <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {code.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{code.credits}</TableCell>
                        <TableCell>
                          <span className={code.used_count >= code.max_uses ? "text-red-500" : ""}>
                            {code.used_count}/{code.max_uses}
                          </span>
                        </TableCell>
                        <TableCell>{code.valid_days}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant={code.is_active ? "default" : "secondary"}>
                              {code.is_active ? "Active" : "Inactive"}
                            </Badge>
                            {isExpired(code.expires_at) && (
                              <Badge variant="destructive">Expired</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(code.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => viewUsages(code.id, code.name)}
                              title="查看使用记录"
                            >
                              <Users className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(code)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleActive(code.id, !code.is_active)}
                            >
                              {code.is_active ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(code.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 使用记录对话框 */}
      <Dialog open={usageDialogOpen} onOpenChange={setUsageDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>使用记录 - {selectedCodeName}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            {selectedCodeUsages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                该体验码暂无使用记录
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>用户邮箱</TableHead>
                    <TableHead>使用时间</TableHead>
                    <TableHead>获得积分</TableHead>
                    <TableHead>IP地址</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedCodeUsages.map((usage) => (
                    <TableRow key={usage.id}>
                      <TableCell className="font-medium">{usage.user_email}</TableCell>
                      <TableCell>{new Date(usage.used_at).toLocaleString()}</TableCell>
                      <TableCell>{usage.credits_granted}</TableCell>
                      <TableCell className="font-mono text-sm">{usage.ip_address}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}