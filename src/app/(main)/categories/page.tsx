import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { Badge } from "@/components/ui/badge";
  import { categories } from "@/lib/data";
  
  export default function CategoriesPage() {
    const expenseCategories = categories.filter((c) => c.type === "expense");
    const incomeCategories = categories.filter((c) => c.type === "income");
  
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
            <CardDescription>Categories for your spending.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {expenseCategories.map((category) => (
              <Badge key={category.id} variant="destructive">
                {category.name}
              </Badge>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Income Categories</CardTitle>
            <CardDescription>Categories for your earnings.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {incomeCategories.map((category) => (
              <Badge key={category.id} variant="secondary">
                {category.name}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }
  