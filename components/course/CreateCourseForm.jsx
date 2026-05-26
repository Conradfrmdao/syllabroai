'use client'
import{ createCourse } from "@/actions/course-actions";
import {Card, CardContent, CardHeader, CardTitle,CardDescription} from "@/components/ui/card";
import{Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {useActionState} from "react";

const initialState = {
    success:false,
    message:""
}


export default function CreateCourseForm(){
    const [state,formAction,isPending] = useActionState(createCourse, initialState)
     
     return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Course</CardTitle>
        <CardDescription>
          Describe what you want to learn and Syllabro Ai will generate a
          structured course.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="space-y-4">
          <Input name="title" placeholder="Course Title" />

          <Textarea
            name="description"
            placeholder="What do you want to learn?"
          />

          {state.message && (
            <p
              className={
                state.success
                  ? "text-sm text-green-600"
                  : "text-sm text-red-600"
              }
            >
              {state.message}
            </p>
          )}

          <Button type="submit" disabled={isPending}>
            {isPending ? "Generating..." : "Generate Course"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )

}
