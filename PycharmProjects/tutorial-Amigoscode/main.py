n=0
prime=0
composite=0
flag=0
count=0
while True:
    n=int(input("give number"))

    if n==-1:
        break
    else:
        count += 1
        for x in range(2,n):
            while x<n:
                if n%x==0:
                    flag=1
                x+=1
        if flag==1:
            composite+=1
d=count-composite
print(d)
print(composite)
print(count)