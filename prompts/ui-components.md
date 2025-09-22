# shadcn/ui Components Reference

## Available Components in Admin Panel

This project uses shadcn/ui components with dark theme customization. All components are fully typed and accessible.

### Form Components

#### Button

```tsx
import { Button } from "@/components/ui/button"

// Variants
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

#### Input

```tsx
import { Input } from "@/components/ui/input"

<Input
  type="email"
  placeholder="Enter email"
  className="w-full"
/>

// With validation state
<Input
  className={cn("w-full", {
    "border-destructive": hasError,
    "border-green-500": isValid
  })}
/>
```

#### Label

```tsx
import { Label } from "@/components/ui/label"

<Label htmlFor="email" className="text-sm font-medium">
  Email Address
</Label>
```

### Layout Components

#### Card

```tsx
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>User Profile</CardTitle>
    <CardDescription>Manage your account settings</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Save Changes</Button>
  </CardFooter>
</Card>
```

#### Separator

```tsx
import { Separator } from "@/components/ui/separator"

<div className="space-y-4">
  <p>Section 1</p>
  <Separator />
  <p>Section 2</p>
</div>
```

#### Tabs

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

<Tabs defaultValue="profile">
  <TabsList>
    <TabsTrigger value="profile">Profile</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  <TabsContent value="profile">
    <ProfileForm />
  </TabsContent>
  <TabsContent value="settings">
    <SettingsForm />
  </TabsContent>
</Tabs>
```

### Feedback Components

#### Alert

```tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle } from "lucide-react"

<Alert>
  <CheckCircle className="h-4 w-4" />
  <AlertTitle>Success!</AlertTitle>
  <AlertDescription>
    Your changes have been saved successfully.
  </AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertTriangle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Something went wrong. Please try again.
  </AlertDescription>
</Alert>
```

#### Badge

```tsx
import { Badge } from "@/components/ui/badge"

<Badge variant="default">Admin</Badge>
<Badge variant="secondary">Moderator</Badge>
<Badge variant="outline">Pending</Badge>
<Badge variant="destructive">Blocked</Badge>
```

#### Toast (with Sonner)

```tsx
import { toast } from "sonner"

// Success toast
toast.success("User updated successfully")

// Error toast
toast.error("Failed to update user")

// Custom toast
toast("Custom message", {
  description: "Additional details here",
  action: {
    label: "Undo",
    onClick: () => console.log("Undo"),
  },
})
```

### Navigation Components

#### Avatar

```tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

<Avatar>
  <AvatarImage src="/user-avatar.jpg" alt="@username" />
  <AvatarFallback>UN</AvatarFallback>
</Avatar>
```

#### Dropdown Menu

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Sign out</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Data Display Components

#### Table

```tsx
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

<Table>
  <TableCaption>A list of your recent invoices.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Invoice</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>INV001</TableCell>
      <TableCell>Paid</TableCell>
      <TableCell>$250.00</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Overlay Components

#### Dialog

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Action</DialogTitle>
      <DialogDescription>
        This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <div className="flex justify-end space-x-2">
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive">Delete</Button>
    </div>
  </DialogContent>
</Dialog>
```

#### Tooltip

```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline">Hover me</Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>This is a tooltip</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

## Dark Theme Customization

### Color Variables

All components use CSS variables that adapt to dark theme:

```css
:root.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 84% 4.9%;
  --secondary: 217.2 32.6% 17.5%;
  --muted: 217.2 32.6% 17.5%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --destructive: 0 62.8% 30.6%;
}
```

### Custom Styling

```tsx
// Extending component styles
<Button className="bg-blue-600 hover:bg-blue-700 text-white">
  Custom Blue Button
</Button>

// Responsive styling
<Card className="w-full max-w-md md:max-w-lg">
  <CardContent className="p-4 md:p-6">
    Responsive card
  </CardContent>
</Card>
```

## Common Patterns

### Form with Validation

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const formSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
})

function UserForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            {...form.register("email")}
            className={cn({
              "border-destructive": form.formState.errors.email
            })}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

### Loading States

```tsx
import { Skeleton } from "@/components/ui/skeleton"

function LoadingCard() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[125px] w-full" />
      </CardContent>
    </Card>
  )
}
```

### User Actions

```tsx
function UserActions({ user }: { user: User }) {
  const handleDelete = async () => {
    try {
      await deleteUser(user.id)
      toast.success("User deleted successfully")
    } catch (error) {
      toast.error("Failed to delete user")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-destructive"
          onClick={handleDelete}
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

## Installation with MCP

Use natural language with Claude Code:

```
"Install the data table component from shadcn"
"Add calendar and date picker components"
"Install command palette component"
"Add progress and loading components"
```

## Accessibility

All components include:

- Proper ARIA attributes
- Keyboard navigation
- Focus management
- Screen reader support
- Color contrast compliance (WCAG AA)

## Best Practices

1. **Use semantic components**: Choose components that match content meaning
2. **Maintain consistency**: Use the same patterns throughout the app
3. **Test accessibility**: Verify keyboard navigation and screen readers
4. **Responsive design**: Ensure components work on all screen sizes
5. **Loading states**: Implement proper loading and error states
6. **Form validation**: Provide clear error messages and validation
