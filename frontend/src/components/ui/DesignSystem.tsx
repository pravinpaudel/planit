import { Badge } from './Badge';
import { Button } from './Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, GlassCard } from './Card';
import { MilestoneCard, AnimatedMilestoneCard } from './MilestoneCard';
import { FormLabel } from './FormLabel';
import { FormInput } from './FormInput';
import { Toast, ToastContainer } from './Toast';
import { CheckCircle, X } from 'lucide-react';

export const DesignSystem = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-bold mb-2">PlanIt Design System</h1>
        <p className="text-gray-500">A unified design system for the PlanIt application</p>
      </div>
      
      {/* Colors */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Color Palette</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {['primary', 'secondary', 'success', 'warning', 'danger', 'neutral'].map((color) => (
            <div key={color} className="space-y-2">
              <div 
                className={`h-16 rounded-md bg-roadmap-${color}`} 
                aria-label={`${color} color`}
              />
              <p className="text-sm font-medium capitalize">{color}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* Typography */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Typography</h2>
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold">Heading 1</h1>
            <p className="text-sm text-gray-500">4xl / Bold</p>
          </div>
          <div>
            <h2 className="text-3xl font-semibold">Heading 2</h2>
            <p className="text-sm text-gray-500">3xl / Semibold</p>
          </div>
          <div>
            <h3 className="text-2xl font-medium">Heading 3</h3>
            <p className="text-sm text-gray-500">2xl / Medium</p>
          </div>
          <div>
            <p className="text-base">Body Text</p>
            <p className="text-sm text-gray-500">base / Regular</p>
          </div>
          <div>
            <p className="text-sm">Small Text</p>
            <p className="text-sm text-gray-500">sm / Regular</p>
          </div>
        </div>
      </section>
      
      {/* Buttons */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Buttons</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="success">Success</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="accent">Accent</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button disabled>Disabled</Button>
            <Button isLoading>Loading</Button>
            <Button className="gap-2">
              <CheckCircle className="h-4 w-4" />
              With Icon
            </Button>
          </div>
        </div>
      </section>
      
      {/* Badges */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Badges</h2>
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="accent">Accent</Badge>
        </div>
      </section>
      
      {/* Cards */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Regular Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This is a standard card component with header and content.</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="ghost">Cancel</Button>
              <Button>Save</Button>
            </CardFooter>
          </Card>
          
          <GlassCard>
            <CardHeader>
              <CardTitle>Glass Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This card has a glassmorphism effect with backdrop blur.</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="ghost">Cancel</Button>
              <Button>Save</Button>
            </CardFooter>
          </GlassCard>
        </div>
      </section>
      
      {/* Milestone Cards */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Milestone Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MilestoneCard priority={1} className="p-4">
            <div className="flex justify-between">
              <div>
                <h3 className="font-medium">Low Priority</h3>
                <p className="text-sm text-gray-500">Priority level 1 milestone</p>
              </div>
              <Badge variant="secondary">P1</Badge>
            </div>
          </MilestoneCard>
          
          <MilestoneCard priority={2} className="p-4">
            <div className="flex justify-between">
              <div>
                <h3 className="font-medium">Medium Priority</h3>
                <p className="text-sm text-gray-500">Priority level 2 milestone</p>
              </div>
              <Badge variant="warning">P2</Badge>
            </div>
          </MilestoneCard>
          
          <MilestoneCard priority={3} className="p-4">
            <div className="flex justify-between">
              <div>
                <h3 className="font-medium">High Priority</h3>
                <p className="text-sm text-gray-500">Priority level 3 milestone</p>
              </div>
              <Badge variant="default">P3</Badge>
            </div>
          </MilestoneCard>
          
          <MilestoneCard isCompleted priority={1} className="p-4">
            <div className="flex justify-between">
              <div>
                <h3 className="font-medium">Completed</h3>
                <p className="text-sm text-gray-500">A completed milestone</p>
              </div>
              <Badge variant="success">Done</Badge>
            </div>
          </MilestoneCard>
        </div>
      </section>
      
      {/* Form Elements */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Form Elements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <FormLabel htmlFor="name">Name</FormLabel>
              <FormInput id="name" placeholder="Enter your name" />
            </div>
            <div>
              <FormLabel htmlFor="email" required>Email</FormLabel>
              <FormInput id="email" type="email" placeholder="Enter your email" />
            </div>
            <div>
              <FormLabel htmlFor="password-error">Password</FormLabel>
              <FormInput 
                id="password-error" 
                type="password" 
                hasError 
                errorMessage="Password must be at least 8 characters" 
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Toasts */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Toast Notifications</h2>
        <div className="space-y-4">
          <Toast 
            variant="success" 
            title="Success" 
            message="Operation completed successfully" 
            showClose={false}
          />
          
          <Toast 
            variant="error" 
            title="Error" 
            message="An error occurred while processing your request" 
            showClose={false}
          />
          
          <Toast 
            variant="warning" 
            title="Warning" 
            message="This action might have consequences" 
            showClose={false}
          />
          
          <Toast 
            variant="info" 
            title="Information" 
            message="Here's some information you should know" 
            showClose={false}
          />
        </div>
      </section>
    </div>
  );
};

export default DesignSystem;
