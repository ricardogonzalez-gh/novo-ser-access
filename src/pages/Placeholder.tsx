import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";

const Placeholder = ({ title }: { title: string }) => (
  <AppLayout>
    <div className="max-w-7xl mx-auto">
      <Card>
        <CardContent className="py-16 text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground">🚧 Em construção</p>
        </CardContent>
      </Card>
    </div>
  </AppLayout>
);

export default Placeholder;
