import { Button } from "@/components/ui";

export default function UIComponentsExamples() {
  return (
    <div className="space-y-12 p-8">
      <h1 className="text-3xl font-bold text-center">UI Components Showcase</h1>
      
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold">Button Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Default Variants */}
          <div className="space-y-4">
            <h3 className="font-medium">Default Variants</h3>
            <div className="space-y-3">
              <Button variant="default">Default</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="secondary">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>
          
          {/* Size Variants */}
          <div className="space-y-4">
            <h3 className="font-medium">Size Variants</h3>
            <div className="space-y-3">
              <Button size="icon" variant="ghost" aria-label="Icon button">
                {/* Would normally have an icon here */}
                🔍
              </Button>
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>
          
          {/* Combined Variants */}
          <div className="space-y-4">
            <h3 className="font-medium">Combined Variants</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="destructive" size="sm">Destrutivo Small</Button>
              <Button variant="secondary" size="lg">Outline Large</Button>
              <Button variant="secondary" size="sm">Secondary Small</Button>
              <Button variant="ghost" size="lg">Ghost Large</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <h2 className="text-2xl font-semibold">Button States</h2>
        <div className="space-y-4">
          <h3 className="font-medium">Interactive States</h3>
          <div className="space-y-3">
            <Button variant="default" disabled>
              Disabled Button
            </Button>
            <Button variant="default" isLoading>
              Loading...
            </Button>
            <Button variant="default" isLoading>
              Loading...
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <h2 className="text-2xl font-semibold">Button with Icons</h2>
        <div className="space-y-4">
          <h3 className="font-medium">Icon Variations</h3>
          <div className="space-y-3 flex flex-col md:flex-row gap-4">
            <Button variant="default">
              <span className="mr-2">📧</span> Send Email
            </Button>
            <Button variant="secondary">
              <span className="mr-2">💾</span> Save
            </Button>
            <Button variant="ghost">
              <span className="mr-2">🗑️</span> Delete
            </Button>
            <Button variant="link">
              <span className="mr-2">🔗</span> Learn More
            </Button>
            <Button variant="destructive" size="icon" aria-label="Delete item">
              🗑️
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}