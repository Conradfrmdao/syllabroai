import {Card, CardContent, CardHeader, CardTitle,CardDescription} from "@/components/ui/card";
import{Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import { createCourse } from "@/actions/course-actions";
import CreateCourseForm from "@/components/course/CreateCourseForm";

export default function CreateCoursePage() {
  return (
    <CreateCourseForm/>
  )}
