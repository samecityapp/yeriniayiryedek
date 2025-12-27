'use client'

import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { holidayRegions } from '@/lib/constants/regions'
import { LOCATIONS } from '@/lib/constants'

import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
    CommandGroup,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

/**
 * Türkçe karakter sorunlarını minimize eden normalizasyon:
 * - tr locale lower
 * - ı/İ/ş/ğ/ü/ö/ç -> i/i/s/g/u/o/c
 * - boşluk/punkt. sadeleştirme
 */
function normalizeTR(input: string) {
    return (input ?? '')
        .toLocaleLowerCase('tr-TR')
        .replace(/İ/g, 'i')
        .replace(/I/g, 'ı')
        .replace(/ı/g, 'i')
        .replace(/ş/g, 's')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[’'".,()/\\-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

/**
 * holidayRegions -> string[] (dedupe + stable)
 * Örnek çıktılar:
 * - "Muğla"
 * - "Bodrum, Muğla"
 * - "Yalıkavak, Bodrum"
 */
function flattenHolidayRegions(
    regions: Array<{
        city: string
        districts?: Array<{ name: string; areas?: string[] }>
    }>
): string[] {
    const out = new Set<string>()

    for (const cityObj of regions ?? []) {
        const city = cityObj?.city?.trim()
        if (!city) continue

        out.add(city)

        for (const d of cityObj?.districts ?? []) {
            const district = d?.name?.trim()
            if (!district) continue

            // Fethiye, Bodrum gibi ilçeleri tek başına da ekle
            if (district !== 'Merkez') {
                out.add(district)
            }
            out.add(`${district}, ${city}`)

            for (const area of d?.areas ?? []) {
                const a = (area ?? '').trim()
                if (!a) continue
                out.add(`${a}, ${district}`)
            }
        }
    }

    return Array.from(out).sort((a, b) => a.localeCompare(b, 'tr-TR'))
}

type LocationSelectProps = {
    value?: string
    onChange: (value: string) => void
    placeholder?: string
    disabled?: boolean
    className?: string
}

export default function LocationSelect({
    value,
    onChange,
    placeholder = 'Konum seç…',
    disabled,
    className,
}: LocationSelectProps) {
    const [open, setOpen] = React.useState(false)

    const options = React.useMemo(() => {
        // client-side güvenli + stable
        const regions = flattenHolidayRegions(holidayRegions as any)
        const popularLocations = LOCATIONS.map(l => l.title)

        // Merge and deduplicate
        const combined = new Set([...regions, ...popularLocations])
        return Array.from(combined).sort((a, b) => a.localeCompare(b, 'tr-TR'))
    }, [])

    // Command'in filter prop'u: 0 dönerse item görünmez
    const turkishFilter = React.useCallback((itemValue: string, search: string) => {
        const v = normalizeTR(itemValue)
        const s = normalizeTR(search)
        if (!s) return 1
        return v.includes(s) ? 1 : 0
    }, [])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn('w-full justify-between', className)}
                >
                    <span className={cn('truncate', !value && 'text-muted-foreground')}>
                        {value || placeholder}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-white" align="start">
                <Command filter={turkishFilter}>
                    <CommandInput placeholder="Ara… (örn: fet, sapanca, izmir)" />
                    <CommandList>
                        <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
                        <CommandGroup>
                            {options.map((opt) => (
                                <CommandItem
                                    key={opt}
                                    value={opt}
                                    onSelect={() => {
                                        onChange(opt)
                                        setOpen(false)
                                    }}
                                    className="cursor-pointer pointer-events-auto data-[disabled]:pointer-events-auto data-[disabled]:opacity-100 aria-selected:bg-blue-100 aria-selected:text-blue-900 data-[selected=true]:bg-blue-100 data-[selected=true]:text-blue-900"
                                >
                                    <Check
                                        className={cn('mr-2 h-4 w-4', value === opt ? 'opacity-100' : 'opacity-0')}
                                    />
                                    {opt}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
