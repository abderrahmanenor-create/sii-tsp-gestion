"use client"

import { useAuth } from "@/hooks/use-session"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  ArrowUpDown,
  ArrowDownCircle,
  ArrowUpCircle,
  Move,
  ClipboardList,
  Edit,
  Trash2,
  Loader2,
  TrendingDown,
  TrendingUp
} from "lucide-react"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "sonner"
import { TypeMouvement, typeMouvementLabels } from "@/lib/types"

interface Article {
  id: string
  code: string
  nom: string
  description?: string | null
  unite: string
  seuilAlerte: number
  categorieId: string
  categorie?: { id: string; nom: string }
  stocksZone?: { zoneId: string; zone?: { nom: string; code: string }; quantite: number }[]
  stockTotal?: number
}

interface Categorie {
  id: string
  nom: string
}

interface Zone {
  id: string
  code: string
  nom: string
}

interface Mouvement {
  id: string
  articleId: string
  zoneId: string
  type: TypeMouvement
  quantite: number
  motif?: string | null
  referenceDoc?: string | null
  createdAt: string
  article?: { code: string; nom: string; unite: string }
  zone?: { code: string; nom: string }
  user?: { nom: string; prenom: string }
}

export default function StockPage() {
  const { user, isAdmin, isChefProjet } = useAuth()
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Categorie[]>([])
  const [zones, setZones] = useState<Zone[]>([])
  const [mouvements, setMouvements] = useState<Mouvement[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [alertesOnly, setAlertesOnly] = useState(false)
  
  // Dialogs
  const [articleDialogOpen, setArticleDialogOpen] = useState(false)
  const [mouvementDialogOpen, setMouvementDialogOpen] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)

  // Article form
  const [articleForm, setArticleForm] = useState({
    code: "",
    nom: "",
    description: "",
    unite: "pcs",
    seuilAlerte: 10,
    categorieId: ""
  })

  // Mouvement form
  const [mouvementForm, setMouvementForm] = useState({
    articleId: "",
    zoneId: "",
    type: TypeMouvement.ENTREE,
    quantite: 1,
    motif: "",
    referenceDoc: ""
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [articlesRes, categoriesRes, zonesRes, mouvementsRes] = await Promise.all([
        fetch("/api/stock/articles"),
        fetch("/api/categories"),
        fetch("/api/zones"),
        fetch("/api/stock/mouvements")
      ])

      if (articlesRes.ok) setArticles(await articlesRes.json())
      if (categoriesRes.ok) setCategories(await categoriesRes.json())
      if (zonesRes.ok) setZones(await zonesRes.json())
      if (mouvementsRes.ok) setMouvements(await mouvementsRes.json())
    } catch (error) {
      console.error("Erreur chargement données:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredArticles = articles.filter(article => {
    const matchesSearch = 
      article.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.nom.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (alertesOnly) {
      return matchesSearch && (article.stockTotal || 0) < article.seuilAlerte
    }
    return matchesSearch
  })

  const alertesCount = articles.filter(a => (a.stockTotal || 0) < a.seuilAlerte).length

  const handleArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingArticle ? `/api/stock/articles/${editingArticle.id}` : "/api/stock/articles"
      const method = editingArticle ? "PUT" : "POST"
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(articleForm)
      })

      if (res.ok) {
        toast.success(editingArticle ? "Article modifié" : "Article créé")
        setArticleDialogOpen(false)
        resetArticleForm()
        fetchData()
      } else {
        toast.error("Erreur lors de l'enregistrement")
      }
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement")
    }
  }

  const handleMouvementSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const res = await fetch("/api/stock/mouvements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mouvementForm)
      })

      if (res.ok) {
        toast.success("Mouvement enregistré")
        setMouvementDialogOpen(false)
        resetMouvementForm()
        fetchData()
      } else {
        const error = await res.json()
        toast.error(error.error || "Erreur lors de l'enregistrement")
      }
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement")
    }
  }

  const handleDeleteArticle = async (id: string) => {
    if (!confirm("Supprimer cet article ?")) return

    try {
      const res = await fetch(`/api/stock/articles/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Article supprimé")
        fetchData()
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    }
  }

  const resetArticleForm = () => {
    setArticleForm({
      code: "",
      nom: "",
      description: "",
      unite: "pcs",
      seuilAlerte: 10,
      categorieId: ""
    })
    setEditingArticle(null)
  }

  const resetMouvementForm = () => {
    setMouvementForm({
      articleId: "",
      zoneId: "",
      type: TypeMouvement.ENTREE,
      quantite: 1,
      motif: "",
      referenceDoc: ""
    })
  }

  const openEditArticle = (article: Article) => {
    setEditingArticle(article)
    setArticleForm({
      code: article.code,
      nom: article.nom,
      description: article.description || "",
      unite: article.unite,
      seuilAlerte: article.seuilAlerte,
      categorieId: article.categorieId
    })
    setArticleDialogOpen(true)
  }

  const getMouvementIcon = (type: TypeMouvement) => {
    switch (type) {
      case TypeMouvement.ENTREE: return <ArrowDownCircle className="w-4 h-4 text-green-500" />
      case TypeMouvement.SORTIE: return <ArrowUpCircle className="w-4 h-4 text-red-500" />
      case TypeMouvement.TRANSFERT_ENTREE: return <Move className="w-4 h-4 text-blue-500" />
      case TypeMouvement.TRANSFERT_SORTIE: return <Move className="w-4 h-4 text-orange-500" />
      default: return <ClipboardList className="w-4 h-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-[#002E5D]" />
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#002E5D]">Gestion du Stock</h1>
          <p className="text-gray-600">Gérez vos articles et mouvements de stock</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={mouvementDialogOpen} onOpenChange={setMouvementDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-[#002E5D] text-[#002E5D]">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Mouvement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleMouvementSubmit}>
                <DialogHeader>
                  <DialogTitle>Nouveau Mouvement de Stock</DialogTitle>
                  <DialogDescription>
                    Enregistrez une entrée, sortie ou transfert
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Article *</Label>
                    <Select value={mouvementForm.articleId} onValueChange={(v) => setMouvementForm({ ...mouvementForm, articleId: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un article" />
                      </SelectTrigger>
                      <SelectContent>
                        {articles.map((article) => (
                          <SelectItem key={article.id} value={article.id}>
                            {article.code} - {article.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Type *</Label>
                      <Select value={mouvementForm.type} onValueChange={(v) => setMouvementForm({ ...mouvementForm, type: v as TypeMouvement })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(typeMouvementLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Zone *</Label>
                      <Select value={mouvementForm.zoneId} onValueChange={(v) => setMouvementForm({ ...mouvementForm, zoneId: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {zones.map((zone) => (
                            <SelectItem key={zone.id} value={zone.id}>{zone.nom}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Quantité *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={mouvementForm.quantite}
                      onChange={(e) => setMouvementForm({ ...mouvementForm, quantite: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Référence document</Label>
                    <Input
                      value={mouvementForm.referenceDoc}
                      onChange={(e) => setMouvementForm({ ...mouvementForm, referenceDoc: e.target.value })}
                      placeholder="N° bon de sortie, bon de réception..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Motif</Label>
                    <Textarea
                      value={mouvementForm.motif}
                      onChange={(e) => setMouvementForm({ ...mouvementForm, motif: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-[#002E5D] hover:bg-[#001a36]">
                    Enregistrer
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={articleDialogOpen} onOpenChange={(open) => { setArticleDialogOpen(open); if (!open) resetArticleForm() }}>
            <DialogTrigger asChild>
              <Button className="bg-[#002E5D] hover:bg-[#001a36]">
                <Plus className="w-4 h-4 mr-2" />
                Nouvel Article
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleArticleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingArticle ? "Modifier l'article" : "Nouvel article"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Code *</Label>
                      <Input
                        value={articleForm.code}
                        onChange={(e) => setArticleForm({ ...articleForm, code: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Catégorie *</Label>
                      <Select value={articleForm.categorieId} onValueChange={(v) => setArticleForm({ ...articleForm, categorieId: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.nom}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Nom *</Label>
                    <Input
                      value={articleForm.nom}
                      onChange={(e) => setArticleForm({ ...articleForm, nom: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Description</Label>
                    <Textarea
                      value={articleForm.description}
                      onChange={(e) => setArticleForm({ ...articleForm, description: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Unité</Label>
                      <Select value={articleForm.unite} onValueChange={(v) => setArticleForm({ ...articleForm, unite: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pcs">Pièces (pcs)</SelectItem>
                          <SelectItem value="m">Mètres (m)</SelectItem>
                          <SelectItem value="kg">Kilogrammes (kg)</SelectItem>
                          <SelectItem value="l">Litres (l)</SelectItem>
                          <SelectItem value="u">Unité (u)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Seuil d'alerte</Label>
                      <Input
                        type="number"
                        min="0"
                        value={articleForm.seuilAlerte}
                        onChange={(e) => setArticleForm({ ...articleForm, seuilAlerte: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-[#002E5D] hover:bg-[#001a36]">
                    {editingArticle ? "Modifier" : "Créer"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Articles</p>
                <p className="text-2xl font-bold">{articles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={alertesCount > 0 ? "border-red-200 bg-red-50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Alertes Stock</p>
                <p className="text-2xl font-bold text-red-600">{alertesCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <ArrowUpDown className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Mouvements</p>
                <p className="text-2xl font-bold">{mouvements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="articles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="mouvements">Mouvements</TabsTrigger>
          <TabsTrigger value="alertes">
            Alertes
            {alertesCount > 0 && (
              <Badge variant="destructive" className="ml-2">{alertesCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="articles">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par code ou nom..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant={alertesOnly ? "default" : "outline"}
                  onClick={() => setAlertesOnly(!alertesOnly)}
                  className={alertesOnly ? "bg-red-500 hover:bg-red-600" : ""}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Alertes uniquement
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Stock Total</TableHead>
                      <TableHead>Seuil</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredArticles.map((article) => {
                      const stockTotal = article.stockTotal || 0
                      const isAlert = stockTotal < article.seuilAlerte
                      return (
                        <TableRow key={article.id} className={isAlert ? "bg-red-50" : ""}>
                          <TableCell className="font-mono">{article.code}</TableCell>
                          <TableCell className="font-medium">{article.nom}</TableCell>
                          <TableCell>{article.categorie?.nom || "-"}</TableCell>
                          <TableCell>
                            <span className={isAlert ? "text-red-600 font-bold" : ""}>
                              {stockTotal} {article.unite}
                            </span>
                          </TableCell>
                          <TableCell>{article.seuilAlerte}</TableCell>
                          <TableCell>
                            {isAlert ? (
                              <Badge variant="destructive">
                                <TrendingDown className="w-3 h-3 mr-1" />
                                Sous seuil
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-green-100 text-green-700">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                OK
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => openEditArticle(article)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteArticle(article.id)} className="text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mouvements">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Mouvements</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Article</TableHead>
                      <TableHead>Zone</TableHead>
                      <TableHead>Quantité</TableHead>
                      <TableHead>Référence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mouvements.map((mvt) => (
                      <TableRow key={mvt.id}>
                        <TableCell>
                          {format(new Date(mvt.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getMouvementIcon(mvt.type)}
                            {typeMouvementLabels[mvt.type]}
                          </div>
                        </TableCell>
                        <TableCell>
                          {mvt.article?.code} - {mvt.article?.nom}
                        </TableCell>
                        <TableCell>{mvt.zone?.nom}</TableCell>
                        <TableCell className="font-medium">
                          {mvt.type === TypeMouvement.ENTREE || mvt.type === TypeMouvement.TRANSFERT_ENTREE ? (
                            <span className="text-green-600">+{mvt.quantite}</span>
                          ) : (
                            <span className="text-red-600">-{mvt.quantite}</span>
                          )} {mvt.article?.unite}
                        </TableCell>
                        <TableCell>{mvt.referenceDoc || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alertes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Articles sous le seuil d'alerte
              </CardTitle>
              <CardDescription>
                Ces articles nécessitent un réapprovisionnement urgent
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alertesCount === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune alerte</p>
                  <p className="text-sm">Tous les stocks sont au-dessus du seuil</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {articles
                    .filter(a => (a.stockTotal || 0) < a.seuilAlerte)
                    .map((article) => (
                      <div
                        key={article.id}
                        className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200"
                      >
                        <div>
                          <p className="font-medium">{article.nom}</p>
                          <p className="text-sm text-gray-500">{article.code} • {article.categorie?.nom}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-red-600 font-bold">
                            {article.stockTotal} / {article.seuilAlerte} {article.unite}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setMouvementForm({ ...mouvementForm, articleId: article.id, type: TypeMouvement.ENTREE })
                              setMouvementDialogOpen(true)
                            }}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Réapprovisionner
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
