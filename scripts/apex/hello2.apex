Set<String> strings = new Set<String>();

Set<String> set1 = new Set<String>{'a','b','c'};
Set<String> set2 = new Set<String>{'c','d','e'};
Set<String> set3 = new Set<String>();
strings.addAll(set2);
strings.addAll(set3);
System.debug(strings);
