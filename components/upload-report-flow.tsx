"use client";

import { ArrowRight, FileSearch, Link2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function UploadReportFlow() {
  return (
    <Card className="border-white/10 bg-white/[0.035] shadow-none">
      <CardHeader className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Report studio</p>
            <CardTitle className="mt-2 text-xl leading-7">Analyze profile flow</CardTitle>
          </div>
          <div className="flex size-10 items-center justify-center rounded-md border border-sky-300/20 bg-sky-300/10 text-sky-200">
            <FileSearch className="size-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-5 pt-0">
        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm text-slate-300">
            <Upload className="size-4 text-emerald-200" />
            Resume file
          </span>
          <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-white/15 bg-slate-950/55 px-4 text-center text-sm leading-6 text-slate-500">
            Drop a PDF or DOCX resume to begin profile analysis
          </div>
        </label>

        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm text-slate-300">
            <Link2 className="size-4 text-sky-200" />
            Job posting URL
          </span>
          <Input
            readOnly
            value="{target_role} · {location}"
            className="h-11 border-white/10 bg-slate-950/55 text-slate-400"
          />
        </label>

        <Button className="h-11 w-full" type="button">
          Preview analysis
          <ArrowRight />
        </Button>
      </CardContent>
    </Card>
  );
}
