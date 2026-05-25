import {Card,CardContent,CardHeader,CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";

export default function Dashboard() {
  const stats=[
    {
      title:'Courses Today',
      value:'1/2'
    },
    {
      title:'Total Courses',
      value:'4'
    },
    {
      title:"Quizzes Generated",
      value:'8'
    },
    {
      title:"Exams Generated",
      value:'2'
    },
  ]
  return (
    <div>
      <section className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your AI-generated learning materials.
          </p>
        </div>

        <Badge>Free Plan</Badge>

      </section>

     <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>
      
      <section>
        <Button>Create New Course</Button>
      </section>

    </div>
  )
}
